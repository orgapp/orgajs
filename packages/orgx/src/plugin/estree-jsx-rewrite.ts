import type { BaseNode } from 'estree'
import type * as jsxType from 'estree-jsx'
import { name as isIdentifierName } from 'estree-util-is-identifier-name'
import { walk } from 'estree-walker'
import { analyze } from 'periscopic'
import specifiersToObjectPattern from '../estree/specifiers-to-object-pattern'

export interface Options {
  providerImportSource?: string
  outputFormat: 'program' | 'function-body'
}

function isJSXElement(node: BaseNode): node is jsxType.JSXElement {
  return node.type === 'JSXElement'
}

function isFunctionDeclaration(
  node: BaseNode
): node is jsxType.FunctionDeclaration {
  return node.type === 'FunctionDeclaration'
}

/**
 * A plugin that rewrites JSX in functions to accept components as
 * `props.components` (when the function is called `OrgaContent`), or from
 * a provider (if there is one).
 * It also makes sure that any undefined components are defined: either from
 * received components or as a function that throws an error.
 */
export function estreeJsxRewrite(options: Options) {
  const { providerImportSource, outputFormat } = options

  return (tree) => {
    // Find everything that’s defined in the top-level scope.
    const topScope = analyze(tree).scope.declarations
    const stack: {
      objects: string[]
      components: string[]
      tags: string[]
    }[] = []
    let importProvider = false

    walk(tree, {
      enter(node) {
        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          stack.push({ objects: [], components: [], tags: [] })
        }

        if (isJSXElement(node) && stack.length > 0) {
          const element = /** @type {JSXElement} */ node
          // Note: inject into the *top-level* function that contains JSX.
          // Yes: we collect info about the stack, but we assume top-level functions
          // are components.
          const scope = stack[0]
          let name = node.openingElement.name

          // `<x.y>`, `<Foo.Bar>`, `<x.y.z>`.
          if (name.type === 'JSXMemberExpression') {
            // Find the left-most identifier.
            while (name.type === 'JSXMemberExpression') name = name.object

            if (
              !scope.objects.includes(name.name) &&
              !topScope.has(name.name)
            ) {
              scope.objects.push(name.name)
            }
          }
          // `<xml:thing>`.
          else if (name.type === 'JSXNamespacedName') {
            // Ignore namespaces.
          }
          // If the name is a valid ES identifier, and it doesn’t start with a
          // lowercase letter, it’s a component.
          // For example, `$foo`, `_bar`, `Baz` are all component names.
          // But `foo` and `b-ar` are tag names.
          else if (isIdentifierName(name.name) && !/^[a-z]/.test(name.name)) {
            if (
              !scope.components.includes(name.name) &&
              !topScope.has(name.name)
            ) {
              scope.components.push(name.name)
            }
          }
          // @ts-expect-error Allow fields passed through from mdast through hast to
          // esast.
          else if (element.data && element.data._xdmExplicitJsx) {
            // Do not turn explicit JSX into components from `_components`.
            // As in, a given `h1` component is used for `# heading` (next case),
            // but not for `<h1>heading</h1>`.
          } else {
            if (!scope.tags.includes(name.name)) {
              scope.tags.push(name.name)
            }

            element.openingElement.name = {
              type: 'JSXMemberExpression',
              object: { type: 'JSXIdentifier', name: '_components' },
              property: name,
            }

            if (element.closingElement) {
              element.closingElement.name = {
                type: 'JSXMemberExpression',
                object: { type: 'JSXIdentifier', name: '_components' },
                property: { type: 'JSXIdentifier', name: name.name },
              }
            }
          }
        }
      },
      leave(node) {
        const defaults: jsxType.Property[] = []
        const actual: string[] = []
        const parameters: jsxType.Expression[] = []
        const declarations: jsxType.VariableDeclarator[] = []

        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          const fn = node as jsxType.Function
          const scope = stack.pop()
          let name: string

          // Supported for types but our stack is good!
          if (!scope) throw new Error('Expected scope on stack')

          for (name of scope.tags) {
            defaults.push({
              type: 'Property',
              kind: 'init',
              key: { type: 'Identifier', name },
              value: { type: 'Literal', value: name },
              method: false,
              shorthand: false,
              computed: false,
            })
          }

          actual.push(...scope.components)

          for (name of scope.objects) {
            // In some cases, a component is used directly (`<X>`) but it’s also
            // used as an object (`<X.Y>`).
            if (!actual.includes(name)) {
              actual.push(name)
            }
          }

          if (defaults.length > 0 || actual.length > 0) {
            parameters.push({ type: 'ObjectExpression', properties: defaults })

            if (providerImportSource) {
              importProvider = true
              parameters.push({
                type: 'CallExpression',
                callee: { type: 'Identifier', name: '_provideComponents' },
                arguments: [],
                optional: false,
              })
            }

            // Accept `components` as a prop if this is the `OrgaContent` function.
            if (
              isFunctionDeclaration(fn) &&
              fn.id &&
              fn.id.name === 'OrgaContent'
            ) {
              parameters.push({
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'props' },
                property: { type: 'Identifier', name: 'components' },
                computed: false,
                optional: false,
              })
            }

            declarations.push({
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: '_components' },
              init:
                parameters.length > 1
                  ? {
                      type: 'CallExpression',
                      callee: {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'Object' },
                        property: { type: 'Identifier', name: 'assign' },
                        computed: false,
                        optional: false,
                      },
                      arguments: parameters,
                      optional: false,
                    }
                  : parameters[0],
            })

            // Add components to scope.
            // For `['MyComponent', 'OrgaLayout']` this generates:
            // ```js
            // const {MyComponent, wrapper: OrgaLayout} = _components
            // ```
            // Note that OrgaLayout is special as it’s taken from
            // `_components.wrapper`.
            if (actual.length > 0) {
              declarations.push({
                type: 'VariableDeclarator',
                id: {
                  type: 'ObjectPattern',
                  properties: actual.map((name) => ({
                    type: 'Property',
                    kind: 'init',
                    key: {
                      type: 'Identifier',
                      name: name === 'OrgaLayout' ? 'wrapper' : name,
                    },
                    value: { type: 'Identifier', name },
                    method: false,
                    shorthand: name !== 'OrgaLayout',
                    computed: false,
                  })),
                },
                init: { type: 'Identifier', name: '_components' },
              })
            }

            // Arrow functions with an implied return:
            if (fn.body.type !== 'BlockStatement') {
              fn.body = {
                type: 'BlockStatement',
                body: [{ type: 'ReturnStatement', argument: fn.body }],
              }
            }

            fn.body.body.unshift({
              type: 'VariableDeclaration',
              kind: 'const',
              declarations,
            })
          }
        }
      },
    })

    // If a provider is used (and can be used), import it.
    if (importProvider && providerImportSource) {
      tree.body.unshift(
        createImportProvider(providerImportSource, outputFormat)
      )
    }
  }
}

function createImportProvider(
  providerImportSource: string,
  outputFormat: Options['outputFormat']
): jsxType.Statement | jsxType.ModuleDeclaration {
  const specifiers: Array<jsxType.ImportSpecifier> = [
    {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: 'useOrgaComponents' },
      local: { type: 'Identifier', name: '_provideComponents' },
    },
  ]

  return outputFormat === 'function-body'
    ? ({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: specifiersToObjectPattern(specifiers),
            init: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arguments' },
              property: { type: 'Literal', value: 0 },
              computed: true,
              optional: false,
            },
          },
        ],
      } as jsxType.Statement)
    : ({
        type: 'ImportDeclaration',
        specifiers,
        source: { type: 'Literal', value: providerImportSource },
      } as jsxType.ModuleDeclaration)
}
