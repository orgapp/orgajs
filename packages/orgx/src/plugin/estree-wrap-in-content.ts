import {
  Directive,
  ExportDefaultDeclaration,
  ExportSpecifier,
  Expression,
  FunctionDeclaration,
  JSXAttribute,
  ModuleDeclaration,
  Program,
  Property,
  SpreadElement,
  Statement,
} from 'estree-jsx'
import { analyze } from 'periscopic'
import stringifyPosition from 'unist-util-stringify-position'
import { URL } from 'url'
import create from '../estree/create'
import declarationToExpression from '../estree/declaration-to-expression'
import isDeclaration from '../estree/is-declaration'
import positionFromEstree from '../estree/position-from-estree'
import specifiersToObjectPattern from '../estree/specifiers-to-object-pattern'

export interface Options {
  baseUrl?: string
  useDynamicImport: boolean
  outputFormat: 'program' | 'function-body'
  pragma: string
  pragmaFrag: string
  pragmaImportSource: string
  jsxImportSource: string
  jsxRuntime: 'automatic' | 'classic'
  passNamedExportsToLayout: boolean
}

export function estreeWrapInContent(options: Options) {
  const {
    baseUrl,
    outputFormat,
    useDynamicImport,
    jsxRuntime,
    pragma,
    pragmaFrag,
    pragmaImportSource,
    jsxImportSource,
    passNamedExportsToLayout,
  } = options

  const pragmas: string[] = []
  let content: boolean | undefined
  let exportAllCount = 0
  let layout: ExportDefaultDeclaration | ExportSpecifier | undefined
  const exportedIdentifiers: (string | [string, string])[] = []
  const replacement: (Directive | Statement | ModuleDeclaration)[] = []

  return (tree, file) => {
    const program = tree as Program

    if (!tree.comments) tree.comments = []

    if (jsxRuntime) {
      pragmas.push('@jsxRuntime ' + jsxRuntime)
    }

    if (jsxRuntime === 'automatic' && jsxImportSource) {
      pragmas.push('@jsxImportSource ' + jsxImportSource)
    }

    if (jsxRuntime === 'classic' && pragma) {
      pragmas.push('@jsx ' + pragma)
    }

    if (jsxRuntime === 'classic' && pragmaFrag) {
      pragmas.push('@jsxFrag ' + pragmaFrag)
    }

    if (pragmas.length > 0) {
      tree.comments.unshift({ type: 'Block', value: pragmas.join(' ') })
    }

    if (jsxRuntime === 'classic') {
      handleEsm({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: { type: 'Identifier', name: pragma.split('.')[0] },
          },
        ],
        source: { type: 'Literal', value: pragmaImportSource },
      })
    }

    // Find the `export default`, the JSX expression, and leave the rest
    // (import/exports) as they are.
    for (const child of program.body) {
      // export default props => <>{props.children}</>
      if (child.type === 'ExportDefaultDeclaration') {
        if (layout) {
          file.fail(
            'Cannot specify multiple layouts (previous: ' +
              stringifyPosition(positionFromEstree(layout)) +
              ')',
            positionFromEstree(child),
            'recma-document:duplicate-layout'
          )
        }

        layout = child
        replacement.push({
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'MDXLayout' },
              init: isDeclaration(child.declaration)
                ? declarationToExpression(child.declaration)
                : child.declaration,
            },
          ],
        })
      }
      // export {a, b as c} from 'd'
      else if (child.type === 'ExportNamedDeclaration' && child.source) {
        const source = child.source

        // Remove `default` or `as default`, but not `default as`, specifier.
        child.specifiers = child.specifiers.filter((specifier) => {
          if (specifier.exported.name === 'default') {
            if (layout) {
              file.fail(
                'Cannot specify multiple layouts (previous: ' +
                  stringifyPosition(positionFromEstree(layout)) +
                  ')',
                positionFromEstree(child),
                'recma-document:duplicate-layout'
              )
            }

            layout = specifier

            // Make it just an import: `import MDXLayout from '…'`.
            handleEsm(
              create(specifier, {
                type: 'ImportDeclaration',
                specifiers: [
                  // Default as default / something else as default.
                  specifier.local.name === 'default'
                    ? {
                        type: 'ImportDefaultSpecifier',
                        local: { type: 'Identifier', name: 'MDXLayout' },
                      }
                    : create(specifier.local, {
                        type: 'ImportSpecifier',
                        imported: specifier.local,
                        local: { type: 'Identifier', name: 'MDXLayout' },
                      }),
                ],
                source: create(source, {
                  type: 'Literal',
                  value: source.value,
                }),
              })
            )

            return false
          }

          return true
        })

        // If there are other things imported, keep it.
        if (child.specifiers.length > 0) {
          handleExport(child)
        }
      }
      // export {a, b as c}
      // export * from 'a'
      else if (
        child.type === 'ExportNamedDeclaration' ||
        child.type === 'ExportAllDeclaration'
      ) {
        handleExport(child)
      } else if (child.type === 'ImportDeclaration') {
        handleEsm(child)
      } else if (
        child.type === 'ExpressionStatement' &&
        // @ts-expect-error types are wrong: `JSXElement`/`JSXFragment` are
        // `Expression`s.
        (child.expression.type === 'JSXFragment' ||
          // @ts-expect-error "
          child.expression.type === 'JSXElement')
      ) {
        content = true
        replacement.push(createMdxContent(child.expression))
        // The following catch-all branch is because plugins might’ve added
        // other things.
        // Normally, we only have import/export/jsx, but just add whatever’s
        // there.
      } else {
        replacement.push(child)
      }
    }

    if (!content) {
      replacement.push(createMdxContent())
    }

    exportedIdentifiers.push(['MDXContent', 'default'])

    if (outputFormat === 'function-body') {
      replacement.push({
        type: 'ReturnStatement',
        argument: {
          type: 'ObjectExpression',
          properties: [
            ...Array.from({ length: exportAllCount }).map(
              (_: undefined, index: number): SpreadElement => ({
                type: 'SpreadElement',
                argument: {
                  type: 'Identifier',
                  name: '_exportAll' + (index + 1),
                },
              })
            ),
            ...exportedIdentifiers.map((d) => {
              const prop: Property = {
                type: 'Property',
                kind: 'init',
                method: false,
                computed: false,
                shorthand: typeof d === 'string',
                key: {
                  type: 'Identifier',
                  name: typeof d === 'string' ? d : d[1],
                },
                value: {
                  type: 'Identifier',
                  name: typeof d === 'string' ? d : d[0],
                },
              }

              return prop
            }),
          ],
        },
      })
    } else {
      replacement.push({
        type: 'ExportDefaultDeclaration',
        declaration: { type: 'Identifier', name: 'MDXContent' },
      })
    }

    program.body = replacement

    function handleExport(node) {
      if (node.type === 'ExportNamedDeclaration') {
        // ```js
        // export function a() {}
        // export class A {}
        // export var a = 1
        // ```
        if (node.declaration) {
          exportedIdentifiers.push(
            ...analyze(node.declaration).scope.declarations.keys()
          )
        }

        // ```js
        // export {a, b as c}
        // export {a, b as c} from 'd'
        // ```
        for (const child of node.specifiers) {
          exportedIdentifiers.push(child.exported.name)
        }
      }

      handleEsm(node)
    }

    function handleEsm(node) {
      // Rewrite the source of the `import` / `export … from`.
      // See: <https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier>
      if (baseUrl && node.source) {
        let value = String(node.source.value)

        try {
          // A full valid URL.
          value = String(new URL(value))
        } catch {
          // Relative: `/example.js`, `./example.js`, and `../example.js`.
          if (/^\.{0,2}\//.test(value)) {
            value = String(new URL(value, baseUrl))
          }
          // Otherwise, it’s a bare specifiers.
          // For example `some-package`, `@some-package`, and
          // `some-package/path`.
          // These are supported in Node and browsers plan to support them
          // with import maps (<https://github.com/WICG/import-maps>).
        }

        node.source = create(node.source, { type: 'Literal', value })
      }

      /** @type {Statement|ModuleDeclaration|undefined} */
      let replace
      /** @type {Expression} */
      let init

      if (outputFormat === 'function-body') {
        if (
          // Always have a source:
          node.type === 'ImportDeclaration' ||
          node.type === 'ExportAllDeclaration' ||
          // Source optional:
          (node.type === 'ExportNamedDeclaration' && node.source)
        ) {
          if (!useDynamicImport) {
            file.fail(
              'Cannot use `import` or `export … from` in `evaluate` (outputting a function body) by default: please set `useDynamicImport: true` (and probably specify a `baseUrl`)',
              positionFromEstree(node),
              'recma-document:invalid-esm-statement'
            )
          }

          // Just for types.
          /* c8 ignore next 3 */
          if (!node.source) {
            throw new Error('Expected `node.source` to be defined')
          }

          // ```
          // import 'a'
          // //=> await import('a')
          // import a from 'b'
          // //=> const {default: a} = await import('b')
          // export {a, b as c} from 'd'
          // //=> const {a, c: b} = await import('d')
          // export * from 'a'
          // //=> const _exportAll0 = await import('a')
          // ```
          init = {
            type: 'AwaitExpression',
            argument: create(node, {
              type: 'ImportExpression',
              source: node.source,
            }),
          }

          if (
            (node.type === 'ImportDeclaration' ||
              node.type === 'ExportNamedDeclaration') &&
            node.specifiers.length === 0
          ) {
            replace = { type: 'ExpressionStatement', expression: init }
          } else {
            replace = {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [
                {
                  type: 'VariableDeclarator',
                  id:
                    node.type === 'ImportDeclaration' ||
                    node.type === 'ExportNamedDeclaration'
                      ? specifiersToObjectPattern(node.specifiers)
                      : {
                          type: 'Identifier',
                          name: '_exportAll' + ++exportAllCount,
                        },
                  init,
                },
              ],
            }
          }
        } else if (node.declaration) {
          replace = node.declaration
        } else {
          /** @type {Array.<VariableDeclarator>} */
          const declarators = node.specifiers
            .filter(
              (specifier) => specifier.local.name !== specifier.exported.name
            )
            .map((specifier) => ({
              type: 'VariableDeclarator',
              id: specifier.exported,
              init: specifier.local,
            }))

          if (declarators.length > 0) {
            replace = {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: declarators,
            }
          }
        }
      } else {
        replace = node
      }

      if (replace) {
        replacement.push(replace)
      }
    }
  }

  function createMdxContent(content = undefined): FunctionDeclaration {
    const props: JSXAttribute[] = []
    const inject = (name: string) => {
      props.push({
        type: 'JSXAttribute',
        name: {
          type: 'JSXIdentifier',
          name,
        },
        value: {
          type: 'JSXExpressionContainer',
          expression: { type: 'Identifier', name },
        },
      })
    }

    if (passNamedExportsToLayout) {
      exportedIdentifiers.forEach((id) => {
        (typeof id === 'string' ? [id] : id).forEach(inject)
      })
    }
    const element = {
      type: 'JSXElement',
      openingElement: {
        type: 'JSXOpeningElement',
        name: { type: 'JSXIdentifier', name: 'MDXLayout' },
        attributes: [
          ...props,
          {
            type: 'JSXSpreadAttribute',
            argument: { type: 'Identifier', name: 'props' },
          },
        ],
        selfClosing: false,
      },
      closingElement: {
        type: 'JSXClosingElement',
        name: { type: 'JSXIdentifier', name: 'MDXLayout' },
      },
      children: [
        {
          type: 'JSXExpressionContainer',
          expression: { type: 'Identifier', name: '_content' },
        },
      ],
    }
    // @ts-expect-error types are wrong: `JSXElement` is an `Expression`.
    const consequent: Expression = element

    return {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'MDXContent' },
      params: [
        {
          type: 'AssignmentPattern',
          left: { type: 'Identifier', name: 'props' },
          right: { type: 'ObjectExpression', properties: [] },
        },
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: '_content' },
                init: content || { type: 'Literal', value: null },
              },
            ],
          },
          {
            type: 'ReturnStatement',
            argument: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'MDXLayout' },
              consequent,
              alternate: { type: 'Identifier', name: '_content' },
            },
          },
        ],
      },
    }
  }
}
