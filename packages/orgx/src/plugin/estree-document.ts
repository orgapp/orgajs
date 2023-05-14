import { analyze } from 'periscopic'
import { stringifyPosition } from 'unist-util-stringify-position'
import { positionFromEstree } from 'unist-util-position-from-estree'
import { walk } from 'estree-walker'
import { create } from '../estree/create.js'
import { Plugin } from 'unified'
import {
  Directive,
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExportSpecifier,
  FunctionDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportExpression,
  ImportSpecifier,
  JSXElement,
  Literal,
  ModuleDeclaration,
  Node,
  Program,
  Property,
  SimpleLiteral,
  SpreadElement,
  Statement,
} from 'estree-jsx'
import isDeclaration from '../estree/is-declaration.js'
import declarationToExpression from '../estree/declaration-to-expression.js'
import { Expression } from 'estree'
import { specifiersToDeclarations } from '../estree/specifiers-to-declarations.js'

export interface Options {
  outputFormat?: 'program' | 'function-body'
  useDynamicImport?: boolean
  baseUrl?: string
  pragma?: string
  pragmaFrag?: string
  pragmaImportSource?: string
  jsxImportSource?: string
  jsxRuntime?: 'automatic' | 'classic'
}

export const LAYOUT_NAME = 'OrgaLayout'
export const CONTENT_NAME = 'OrgaContent'
export const FN_NAME = '_createOrgaContent'

/**
 * A plugin to wrap the estree in `OrgaContent`.
 *
 * @type {import('unified').Plugin<[RecmaDocumentOptions | null | undefined] | [], Program>}
 */
export const estreeDocument: Plugin<
  [Options | null | undefined] | [],
  Program
> = (options) => {
  const options_: Options = options || {}
  const baseUrl = options_.baseUrl || undefined
  const useDynamicImport = options_.useDynamicImport || undefined
  const outputFormat = options_.outputFormat || 'program'
  const pragma = options_.pragma || 'React.createElement'
  const pragmaFrag =
    options_.pragmaFrag === undefined ? 'React.Fragment' : options_.pragmaFrag
  const pragmaImportSource = options_.pragmaImportSource || 'react'
  const jsxImportSource = options_.jsxImportSource || 'react'
  const jsxRuntime = options_.jsxRuntime || 'automatic'

  return (tree, file) => {
    const exportedIdentifiers: ([string, string] | string)[] = []
    const replacement: (Directive | ModuleDeclaration | Statement)[] = []
    const pragmas: string[] = []
    let exportAllCount = 0
    let layout: ExportDefaultDeclaration | ExportSpecifier | undefined
    let content: boolean | undefined
    let child: Node

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

    if (jsxRuntime === 'classic' && pragmaImportSource) {
      if (!pragma) {
        throw new Error(
          'Missing `pragma` in classic runtime with `pragmaImportSource`'
        )
      }

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
    for (child of tree.body) {
      // ```js
      // export default props => <>{props.children}</>
      // ```
      //
      // Treat it as an inline layout declaration.
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
              id: { type: 'Identifier', name: LAYOUT_NAME },
              init: isDeclaration(child.declaration)
                ? declarationToExpression(child.declaration)
                : child.declaration,
            },
          ],
        })
      }
      // ```js
      // export {a, b as c} from 'd'
      // ```
      else if (child.type === 'ExportNamedDeclaration' && child.source) {
        const source = child.source as SimpleLiteral

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

            // Make it just an import: `import OrgaLayout from '…'`.
            const specifiers: (ImportDefaultSpecifier | ImportSpecifier)[] = []

            // Default as default / something else as default.
            if (specifier.local.name === 'default') {
              specifiers.push({
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name: LAYOUT_NAME },
              })
            } else {
              const importSpecifier: ImportSpecifier = {
                type: 'ImportSpecifier',
                imported: specifier.local,
                local: { type: 'Identifier', name: LAYOUT_NAME },
              }
              create(specifier.local, importSpecifier)
              specifiers.push(importSpecifier)
            }

            const from: Literal = { type: 'Literal', value: source.value }
            create(source, from)

            const declaration: ImportDeclaration = {
              type: 'ImportDeclaration',
              specifiers,
              source: from,
            }
            create(specifier, declaration)
            handleEsm(declaration)

            return false
          }

          return true
        })

        // If there are other things imported, keep it.
        if (child.specifiers.length > 0) {
          handleExport(child)
        }
      }
      // ```js
      // export {a, b as c}
      // export * from 'a'
      // ```
      else if (
        child.type === 'ExportNamedDeclaration' ||
        child.type === 'ExportAllDeclaration'
      ) {
        handleExport(child)
      } else if (child.type === 'ImportDeclaration') {
        handleEsm(child)
      } else if (
        child.type === 'ExpressionStatement' &&
        // @ts-expect-error types are wrong: `JSXFragment` is an `Expression`.
        (child.expression.type === 'JSXFragment' ||
          child.expression.type === 'JSXElement')
      ) {
        content = true
        replacement.push(
          ...createOrgaContent(child.expression, Boolean(layout))
        )
        // The following catch-all branch is because plugins might’ve added
        // other things.
        // Normally, we only have import/export/jsx, but just add whatever’s
        // there.
        /* c8 ignore next 3 */
      } else {
        replacement.push(child)
      }
    }

    // If there was no JSX content at all, add an empty function.
    if (!content) {
      replacement.push(...createOrgaContent(undefined, Boolean(layout)))
    }

    exportedIdentifiers.push([CONTENT_NAME, 'default'])

    if (outputFormat === 'function-body') {
      replacement.push({
        type: 'ReturnStatement',
        argument: {
          type: 'ObjectExpression',
          properties: [
            ...Array.from({ length: exportAllCount }).map(
              (_, index): SpreadElement => ({
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
        declaration: { type: 'Identifier', name: CONTENT_NAME },
      })
    }

    tree.body = replacement

    if (baseUrl) {
      walk(tree, {
        enter(node) {
          if (
            node.type === 'MemberExpression' &&
            'object' in node &&
            node.object.type === 'MetaProperty' &&
            node.property.type === 'Identifier' &&
            node.object.meta.name === 'import' &&
            node.object.property.name === 'meta' &&
            node.property.name === 'url'
          ) {
            const replacement: SimpleLiteral = {
              type: 'Literal',
              value: baseUrl,
            }
            this.replace(replacement)
          }
        },
      })
    }

    function handleExport(node: ExportAllDeclaration | ExportNamedDeclaration) {
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
        for (child of node.specifiers) {
          exportedIdentifiers.push(child.exported.name)
        }
      }

      handleEsm(node)
    }

    /**
     * @param {ExportAllDeclaration | ExportNamedDeclaration | ImportDeclaration} node
     * @returns {void}
     */
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

        const literal: Literal = { type: 'Literal', value }
        create(node.source, literal)
        node.source = literal
      }

      /** @type {ModuleDeclaration | Statement | undefined} */
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
          const argument: ImportExpression = {
            type: 'ImportExpression',
            source: node.source,
          }
          create(node, argument)
          init = { type: 'AwaitExpression', argument }

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
              declarations:
                node.type === 'ExportAllDeclaration'
                  ? [
                      {
                        type: 'VariableDeclarator',
                        id: {
                          type: 'Identifier',
                          name: '_exportAll' + ++exportAllCount,
                        },
                        init,
                      },
                    ]
                  : specifiersToDeclarations(node.specifiers, init),
            }
          }
        } else if (node.declaration) {
          replace = node.declaration
        } else {
          /** @type {Array<VariableDeclarator>} */
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

  function createOrgaContent(
    content: Expression | undefined,
    hasInternalLayout: boolean | undefined
  ): FunctionDeclaration[] {
    const element: JSXElement = {
      type: 'JSXElement',
      openingElement: {
        type: 'JSXOpeningElement',
        name: { type: 'JSXIdentifier', name: LAYOUT_NAME },
        attributes: [
          {
            type: 'JSXSpreadAttribute',
            argument: { type: 'Identifier', name: 'props' },
          },
        ],
        selfClosing: false,
      },
      closingElement: {
        type: 'JSXClosingElement',
        name: { type: 'JSXIdentifier', name: LAYOUT_NAME },
      },
      children: [
        {
          type: 'JSXElement',
          openingElement: {
            type: 'JSXOpeningElement',
            name: { type: 'JSXIdentifier', name: FN_NAME },
            attributes: [
              {
                type: 'JSXSpreadAttribute',
                argument: { type: 'Identifier', name: 'props' },
              },
            ],
            selfClosing: true,
          },
          closingElement: null,
          children: [],
        },
      ],
    }

    let result: Expression = element

    if (!hasInternalLayout) {
      result = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: LAYOUT_NAME },
        consequent: result,
        alternate: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: FN_NAME },
          arguments: [{ type: 'Identifier', name: 'props' }],
          optional: false,
        },
      }
    }

    let argument = content || { type: 'Literal', value: null }

    // Unwrap a fragment of a single element.
    if (
      argument &&
      // @ts-expect-error: fine.
      argument.type === 'JSXFragment' &&
      // @ts-expect-error: fine.
      argument.children.length === 1 &&
      // @ts-expect-error: fine.
      argument.children[0].type === 'JSXElement'
    ) {
      // @ts-expect-error: fine.
      argument = argument.children[0]
    }

    return [
      {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: FN_NAME },
        params: [{ type: 'Identifier', name: 'props' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument }],
        },
      },
      {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: CONTENT_NAME },
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'props' },
            right: { type: 'ObjectExpression', properties: [] },
          },
        ],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: result }],
        },
      },
    ]
  }
}
