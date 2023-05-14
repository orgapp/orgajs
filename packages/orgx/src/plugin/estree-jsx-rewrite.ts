import { name as isIdentifierName } from 'estree-util-is-identifier-name'
import { walk } from 'estree-walker'
import { stringifyPosition } from 'unist-util-stringify-position'
import { analyze, Scope as _Scope } from 'periscopic'
import type { Plugin } from 'unified'
import type {
  Program,
  Node,
  Expression,
  Function as EstreeFunction,
  Identifier,
  Statement,
  ModuleDeclaration,
  ImportSpecifier,
} from 'estree-jsx'
import {
  toIdOrMemberExpression,
  toJsxIdOrMemberExpression,
} from '../estree/to-id-or-member-expression.js'
import { positionFromEstree } from 'unist-util-position-from-estree'
import { toBinaryAddition } from '../estree/to-binary-addition.js'
import { specifiersToDeclarations } from '../estree/specifiers-to-declarations.js'
import { CONTENT_NAME, FN_NAME, LAYOUT_NAME } from './estree-document.js'

type Scope = _Scope & {
  node: Node
}

type StackEntry = {
  objects: string[]
  components: string[]
  tags: string[]
  references: Record<string, { node: Node; component: boolean }>
  idToInvalidComponentName: Map<string, string>
  node: EstreeFunction
}

export interface Options {
  development?: boolean
  providerImportSource?: string
  outputFormat?: 'program' | 'function-body'
}

const own = {}.hasOwnProperty

/**
 * A plugin that rewrites JSX in functions to accept components as
 * `props.components` (when the function is called `OrgaContent`), or from
 * a provider (if there is one).
 * It also makes sure that any undefined components are defined: either from
 * received components or as a function that throws an error.
 */
export const estreeJsxRewrite: Plugin<[Options], Program> = (options) => {
  const { development, providerImportSource, outputFormat } = options || {}

  return (tree, file) => {
    // Find everything that’s defined in the top-level scope.
    const scopeInfo = analyze(tree)
    const fnStack: StackEntry[] = []
    let importProvider = false
    let createErrorHelper = false
    let currentScope: Scope | undefined

    walk(tree, {
      enter(node) {
        const newScope = scopeInfo.map.get(node) as Scope

        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          fnStack.push({
            objects: [],
            components: [],
            tags: [],
            references: {},
            idToInvalidComponentName: new Map(),
            node,
          })

          // MDXContent only ever contains MDXLayout
          if (
            isNamedFunction(node, CONTENT_NAME) &&
            newScope &&
            !inScope(newScope, LAYOUT_NAME)
          ) {
            fnStack[0].components.push(LAYOUT_NAME)
          }
        }

        const fnScope = fnStack[0]
        if (
          !fnScope ||
          (!isNamedFunction(fnScope.node, FN_NAME) && !providerImportSource)
        ) {
          return
        }

        if (newScope) {
          newScope.node = node
          currentScope = newScope
        }

        if (currentScope && node.type === 'JSXElement') {
          let name = node.openingElement.name

          // `<x.y>`, `<Foo.Bar>`, `<x.y.z>`.
          if (name.type === 'JSXMemberExpression') {
            /** @type {Array<string>} */
            const ids = []

            // Find the left-most identifier.
            while (name.type === 'JSXMemberExpression') {
              ids.unshift(name.property.name)
              name = name.object
            }

            ids.unshift(name.name)
            const fullId = ids.join('.')
            const id = name.name

            const isInScope = inScope(currentScope, id)

            if (!own.call(fnScope.references, fullId)) {
              const parentScope = currentScope.parent as Scope
              if (
                !isInScope ||
                // If the parent scope is `_createMdxContent`, then this
                // references a component we can add a check statement for.
                (parentScope &&
                  parentScope.node.type === 'FunctionDeclaration' &&
                  isNamedFunction(parentScope.node, FN_NAME))
              ) {
                fnScope.references[fullId] = { node, component: true }
              }
            }

            if (!fnScope.objects.includes(id) && !isInScope) {
              fnScope.objects.push(id)
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
            const id = name.name

            if (!inScope(currentScope, id)) {
              // No need to add an error for an undefined layout — we use an
              // `if` later.
              if (id !== LAYOUT_NAME && !own.call(fnScope.references, id)) {
                fnScope.references[id] = { node, component: true }
              }

              if (!fnScope.components.includes(id)) {
                fnScope.components.push(id)
              }
            }
          }
          // @ts-expect-error Allow fields passed through from mdast through hast to
          // esast.
          else if (node.data && node.data._mdxExplicitJsx) {
            // Do not turn explicit JSX into components from `_components`.
            // As in, a given `h1` component is used for `# heading` (next case),
            // but not for `<h1>heading</h1>`.
          } else {
            const id = name.name

            if (!fnScope.tags.includes(id)) {
              fnScope.tags.push(id)
            }

            /** @type {Array<string | number>} */
            let jsxIdExpression = ['_components', id]
            if (isIdentifierName(id) === false) {
              let invalidComponentName =
                fnScope.idToInvalidComponentName.get(id)
              if (invalidComponentName === undefined) {
                invalidComponentName = `_component${fnScope.idToInvalidComponentName.size}`
                fnScope.idToInvalidComponentName.set(id, invalidComponentName)
              }

              jsxIdExpression = [invalidComponentName]
            }

            node.openingElement.name =
              toJsxIdOrMemberExpression(jsxIdExpression)

            if (node.closingElement) {
              node.closingElement.name =
                toJsxIdOrMemberExpression(jsxIdExpression)
            }
          }
        }
      },
      leave(node) {
        /** @type {Array<Property>} */
        const defaults = []
        /** @type {Array<string>} */
        const actual = []
        /** @type {Array<Expression>} */
        const parameters = []
        /** @type {Array<VariableDeclarator>} */
        const declarations = []

        if (currentScope && currentScope.node === node) {
          // @ts-expect-error: `node`s were patched when entering.
          currentScope = currentScope.parent
        }

        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          const fn = node
          const scope = fnStack[fnStack.length - 1]
          /** @type {string} */
          let name

          for (name of scope.tags) {
            defaults.push({
              type: 'Property',
              kind: 'init',
              key: isIdentifierName(name)
                ? { type: 'Identifier', name }
                : { type: 'Literal', value: name },
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

          /** @type {Array<Statement>} */
          const statements = []

          if (
            defaults.length > 0 ||
            actual.length > 0 ||
            scope.idToInvalidComponentName.size > 0
          ) {
            if (providerImportSource) {
              importProvider = true
              parameters.push({
                type: 'CallExpression',
                callee: { type: 'Identifier', name: '_provideComponents' },
                arguments: [],
                optional: false,
              })
            }

            // Accept `components` as a prop if this is the `MDXContent` or
            // `_createMdxContent` function.
            if (
              isNamedFunction(scope.node, CONTENT_NAME) ||
              isNamedFunction(scope.node, FN_NAME)
            ) {
              parameters.push(toIdOrMemberExpression(['props', 'components']))
            }

            if (defaults.length > 0 || parameters.length > 1) {
              parameters.unshift({
                type: 'ObjectExpression',
                properties: defaults,
              })
            }

            // If we’re getting components from several sources, merge them.
            /** @type {Expression} */
            let componentsInit =
              parameters.length > 1
                ? {
                    type: 'CallExpression',
                    callee: toIdOrMemberExpression(['Object', 'assign']),
                    arguments: parameters,
                    optional: false,
                  }
                : parameters[0].type === 'MemberExpression'
                ? // If we’re only getting components from `props.components`,
                  // make sure it’s defined.
                  {
                    type: 'LogicalExpression',
                    operator: '||',
                    left: parameters[0],
                    right: { type: 'ObjectExpression', properties: [] },
                  }
                : parameters[0]

            /** @type {ObjectPattern | undefined} */
            let componentsPattern

            // Add components to scope.
            // For `['MyComponent', 'MDXLayout']` this generates:
            // ```js
            // const {MyComponent, wrapper: MDXLayout} = _components
            // ```
            // Note that MDXLayout is special as it’s taken from
            // `_components.wrapper`.
            if (actual.length > 0) {
              componentsPattern = {
                type: 'ObjectPattern',
                properties: actual.map((name) => ({
                  type: 'Property',
                  kind: 'init',
                  key: {
                    type: 'Identifier',
                    name: name === LAYOUT_NAME ? 'wrapper' : name,
                  },
                  value: { type: 'Identifier', name },
                  method: false,
                  shorthand: name !== LAYOUT_NAME,
                  computed: false,
                })),
              }
            }

            if (scope.tags.length > 0) {
              declarations.push({
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: '_components' },
                init: componentsInit,
              })
              componentsInit = { type: 'Identifier', name: '_components' }
            }

            if (isNamedFunction(scope.node, FN_NAME)) {
              for (const [
                id,
                componentName,
              ] of scope.idToInvalidComponentName) {
                // For JSX IDs that can’t be represented as JavaScript IDs (as in,
                // those with dashes, such as `custom-element`), generate a
                // separate variable that is a valid JS ID (such as `_component0`),
                // and takes it from components:
                // `const _component0 = _components['custom-element']`
                declarations.push({
                  type: 'VariableDeclarator',
                  id: { type: 'Identifier', name: componentName },
                  init: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: '_components' },
                    property: { type: 'Literal', value: id },
                    computed: true,
                    optional: false,
                  },
                })
              }
            }

            if (componentsPattern) {
              declarations.push({
                type: 'VariableDeclarator',
                id: componentsPattern,
                init: componentsInit,
              })
            }

            if (declarations.length > 0) {
              statements.push({
                type: 'VariableDeclaration',
                kind: 'const',
                declarations,
              })
            }
          }

          /** @type {string} */
          let key

          // Add partials (so for `x.y.z` it’d generate `x` and `x.y` too).
          for (key in scope.references) {
            if (own.call(scope.references, key)) {
              const parts = key.split('.')
              let index = 0
              while (++index < parts.length) {
                const partial = parts.slice(0, index).join('.')
                if (!own.call(scope.references, partial)) {
                  scope.references[partial] = {
                    node: scope.references[key].node,
                    component: false,
                  }
                }
              }
            }
          }

          const references = Object.keys(scope.references).sort()
          let index = -1
          while (++index < references.length) {
            const id = references[index]
            const info = scope.references[id]
            const place = stringifyPosition(positionFromEstree(info.node))
            /** @type {Array<Expression>} */
            const parameters = [
              { type: 'Literal', value: id },
              { type: 'Literal', value: info.component },
            ]

            createErrorHelper = true

            if (development && place !== '1:1-1:1') {
              parameters.push({ type: 'Literal', value: place })
            }

            statements.push({
              type: 'IfStatement',
              test: {
                type: 'UnaryExpression',
                operator: '!',
                prefix: true,
                argument: toIdOrMemberExpression(id.split('.')),
              },
              consequent: {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: '_missingMdxReference' },
                  arguments: parameters,
                  optional: false,
                },
              },
              alternate: null,
            })
          }

          if (statements.length > 0) {
            // Arrow functions with an implied return:
            if (fn.body.type !== 'BlockStatement') {
              fn.body = {
                type: 'BlockStatement',
                body: [{ type: 'ReturnStatement', argument: fn.body }],
              }
            }

            fn.body.body.unshift(...statements)
          }

          fnStack.pop()
        }
      },
    })

    // If a provider is used (and can be used), import it.
    if (importProvider && providerImportSource) {
      tree.body.unshift(
        createImportProvider(providerImportSource, outputFormat)
      )
    }

    // If potentially missing components are used.
    if (createErrorHelper) {
      const message: Expression[] = [
        { type: 'Literal', value: 'Expected ' },
        {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'component' },
          consequent: { type: 'Literal', value: 'component' },
          alternate: { type: 'Literal', value: 'object' },
        },
        { type: 'Literal', value: ' `' },
        { type: 'Identifier', name: 'id' },
        {
          type: 'Literal',
          value:
            '` to be defined: you likely forgot to import, pass, or provide it.',
        },
      ]

      const parameters: Identifier[] = [
        { type: 'Identifier', name: 'id' },
        { type: 'Identifier', name: 'component' },
      ]

      if (development) {
        message.push({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'place' },
          consequent: toBinaryAddition([
            { type: 'Literal', value: '\nIt’s referenced in your code at `' },
            { type: 'Identifier', name: 'place' },
            {
              type: 'Literal',
              value: (file.path ? '` in `' + file.path : '') + '`',
            },
          ]),
          alternate: { type: 'Literal', value: '' },
        })

        parameters.push({ type: 'Identifier', name: 'place' })
      }

      tree.body.push({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: '_missingMdxReference' },
        generator: false,
        async: false,
        params: parameters,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Error' },
                arguments: [toBinaryAddition(message)],
              },
            },
          ],
        },
      })
    }
  }
}

function createImportProvider(
  providerImportSource: string,
  outputFormat: Options['outputFormat']
): Statement | ModuleDeclaration {
  const specifiers: ImportSpecifier[] = [
    {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: 'useOrgaComponents' },
      local: { type: 'Identifier', name: '_provideComponents' },
    },
  ]

  return outputFormat === 'function-body'
    ? {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: specifiersToDeclarations(
          specifiers,
          toIdOrMemberExpression(['arguments', 0])
        ),
      }
    : {
        type: 'ImportDeclaration',
        specifiers,
        source: { type: 'Literal', value: providerImportSource },
      }
}

function isNamedFunction(node: EstreeFunction, name: string) {
  return Boolean(node && 'id' in node && node.id && node.id.name === name)
}

function inScope(scope: Scope, id: string) {
  let currentScope = scope

  while (currentScope) {
    if (currentScope.declarations.has(id)) {
      return true
    }

    currentScope = currentScope.parent as Scope
  }

  return false
}
