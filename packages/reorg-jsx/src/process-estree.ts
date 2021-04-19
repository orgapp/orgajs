import { walk } from 'estree-walker'
import { analyze } from 'periscopic'
import { isDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isExpressionStatement, isJSXElement, isJSXExpression, isJSXFragment } from './type-check'
import _ from 'lodash/fp'

function processEstree(estree, options) {
  const {
    // Default options
    skipExport = false,
    wrapExport
  } = options

  let layout: any
  let children = []
  let mdxLayoutDefault: any

  // Find the `export default`, the JSX expression, and leave the rest
  // (import/exports) as they are.
  estree.body = estree.body.filter(child => {
    // ```js
    // export default a = 1
    // ```
    // if (child.type === 'ExportDefaultDeclaration') {
    //   console.log(`!!!!!!!!ExportDefaultDeclaration!!!!!!!!!!`)
    //   layout = child.declaration
    //   return false
    // }

    // ```js
    // export {default} from "a"
    // export {default as a} from "b"
    // export {default as a, b} from "c"
    // export {a as default} from "b"
    // export {a as default, b} from "c"
    // ```
    // if (child.type === 'ExportNamedDeclaration' && child.source) {
    //   // Remove `default` or `as default`, but not `default as`, specifier.
    //   child.specifiers = child.specifiers.filter(specifier => {
    //     if (specifier.exported.name === 'default') {
    //       mdxLayoutDefault = {local: specifier.local, source: child.source}
    //       return false
    //     }

    //     return true
    //   })

    //   // Keep the export if there are other specifiers, drop it if there was
    //   // just a default.
    //   return child.specifiers.length > 0
    // }

    if (
      child.type === 'ExpressionStatement' &&
      (child.expression.type === 'JSXFragment' ||
        child.expression.type === 'JSXElement')
    ) {
      children =
        child.expression.type === 'JSXFragment'
          ? child.expression.children
          : [child.expression]
      return false
    }

    return true
  })


  // Find everything that’s defined in the top-level scope.
  // Do this here because `estree` currently only includes import/exports
  // and we don’t have to walk all the JSX to figure out the top scope.
  let inTopScope = [
    'MDXLayout',
    'MDXContent',
    ...analyze(estree).scope.declarations.keys()
  ]

  console.log({ inTopScope })

  estree.body = [
    ...estree.body,
    // ...createMdxLayout(layout, mdxLayoutDefault),
    ...createMdxContent(children)
  ]

  let components = []

  // Add `orgaType`, `parentName` props to JSX elements.
  const magicShortcodes = []
  const stack = []

  walk(estree, {
    enter: function (node) {
      // ```js
      // export default a = 1
      // ```
      if (isExportDefaultDeclaration(node)) {
        console.log(`!!!!!!!!ExportDefaultDeclaration!!!!!!!!!!`)
        layout = node.declaration
        this.remove()
        return
      }

      // ```js
      // export {default} from "a"
      // export {default as a} from "b"
      // export {default as a, b} from "c"
      // export {a as default} from "b"
      // export {a as default, b} from "c"
      // ```
      if (isExportNamedDeclaration(node) && !!node.source) {
        console.log(`!!! got export named declaration: ${node.specifiers}`)
        node.specifiers = node.specifiers.filter(specifier => {
          if (specifier.exported.name === 'default') {
            mdxLayoutDefault = { local: specifier.local, source: node.source }
            return false
          }

          return true
        })


        // Keep the export if there are other specifiers, drop it if there was
        // just a default.
        if (node.specifiers.length === 0) {
          this.remove()
          return
        }
      }

      if (isDeclaration(node)) {
        const names = analyze(node).scope.declarations.keys()
        const clean = [...names].filter(n => n !== 'MDXContent')
        if (clean.length > 0) {
          inTopScope = [...inTopScope, ...clean]
          components.push(node)
          this.remove()
          return
        }
      }

      // if (isExpressionStatement(node)) {
      //   const exp = node.expression
      //   let removeNode = false
      //   if (isJSXFragment(exp)) {
      //     // @ts-ignore
      //     children = exp.children
      //     removeNode = true
      //   }
      //   if (isJSXElement(exp)) {
      //     children = [exp]
      //     removeNode = true
      //   }

      //   if (removeNode) {
      //     this.remove()
      //     return
      //   }
      // }

      // unwrap JSXElement
      if (isJSXExpression(node)) {
        this.replace(node.expression)
      }

      if (
        node.type === 'JSXElement' &&
        // To do: support members (`<x.y>`).
        // @ts-ignore
        node.openingElement.name.type === 'JSXIdentifier'
      ) {
        // @ts-ignore
        const name = node.openingElement.name.name

        if (stack.length > 1) {
          const parentName = stack[stack.length - 1]

          // @ts-ignore
          node.openingElement.attributes.push({
            type: 'JSXAttribute',
            name: {type: 'JSXIdentifier', name: 'parentName'},
            value: {
              type: 'Literal',
              value: parentName,
              raw: JSON.stringify(parentName)
            }
          })
        }

        const head = name.charAt(0)

        // A component.
        if (head === head.toUpperCase() && name !== 'MDXLayout') {
        // @ts-ignore
          node.openingElement.attributes.push({
            type: 'JSXAttribute',
            name: {type: 'JSXIdentifier', name: 'orgaType'},
            value: {type: 'Literal', value: name, raw: JSON.stringify(name)}
          })

          if (!inTopScope.includes(name) && !magicShortcodes.includes(name)) {
            magicShortcodes.push(name)
          }
        }

        stack.push(name)
      }
    },
    leave: function (node) {
      if (
        node.type === 'JSXElement' &&
        // To do: support members (`<x.y>`).
        // @ts-ignore
        node.openingElement.name.type === 'JSXIdentifier'
      ) {
        stack.pop()
      }
    }
  })

  const exports = []

  if (!skipExport) {
    let declaration: any = {type: 'Identifier', name: 'MDXContent'}

    if (wrapExport) {
      declaration = {
        type: 'CallExpression',
        callee: {type: 'Identifier', name: wrapExport},
        arguments: [declaration]
      }
    }

    exports.push({type: 'ExportDefaultDeclaration', declaration: declaration})
  }

  estree.body = [
    ...createMakeShortcodeHelper(
      magicShortcodes,
      options.mdxFragment === false
    ),
    ...createMdxLayout(layout, mdxLayoutDefault),
    ...components,
    ...estree.body,
    ...exports
  ]

  return estree
}

function createMdxContent(children) {

  return [
    {
      type: 'FunctionDeclaration',
      id: {type: 'Identifier', name: 'MDXContent'},
      expression: false,
      generator: false,
      async: false,
      params: [
        {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'Property',
              method: false,
              shorthand: true,
              computed: false,
              key: {type: 'Identifier', name: 'components'},
              kind: 'init',
              value: {type: 'Identifier', name: 'components'}
            },
            {type: 'RestElement', argument: {type: 'Identifier', name: 'props'}}
          ]
        }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'JSXElement',
              openingElement: {
                type: 'JSXOpeningElement',
                attributes: [
                  {
                    type: 'JSXAttribute',
                    name: {type: 'JSXIdentifier', name: 'components'},
                    value: {
                      type: 'JSXExpressionContainer',
                      expression: {type: 'Identifier', name: 'components'}
                    }
                  },
                  {
                    type: 'JSXSpreadAttribute',
                    argument: {type: 'Identifier', name: 'props'}
                  }
                ],
                name: {type: 'JSXIdentifier', name: 'MDXLayout'},
                selfClosing: false
              },
              closingElement: {
                type: 'JSXClosingElement',
                name: {type: 'JSXIdentifier', name: 'MDXLayout'}
              },
              children: children
            }
          }
        ]
      }
    },
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'MDXContent'},
          property: {type: 'Identifier', name: 'isMDXComponent'},
          computed: false,
          optional: false
        },
        right: {type: 'Literal', value: true, raw: 'true'}
      }
    }
  ]
}

function createMdxLayout(declaration, mdxLayoutDefault) {
  console.log(`------------- createMdxLayout -------------`)
  console.log({ declaration, mdxLayoutDefault })
  const id = {type: 'Identifier', name: 'MDXLayout'}
  const init = {type: 'Literal', value: 'wrapper', raw: '"wrapper"'}

  return [
    mdxLayoutDefault
      ? {
          type: 'ImportDeclaration',
          specifiers: [
            mdxLayoutDefault.local.name === 'default'
              ? {type: 'ImportDefaultSpecifier', local: id}
              : {
                  type: 'ImportSpecifier',
                  imported: mdxLayoutDefault.local,
                  local: id
                }
          ],
          source: {
            type: 'Literal',
            value: mdxLayoutDefault.source.value,
            raw: mdxLayoutDefault.source.raw
          }
        }
      : {
          type: 'VariableDeclaration',
          declarations: [
            {type: 'VariableDeclarator', id: id, init: declaration || init}
          ],
          kind: 'const'
        }
  ]
}

function createMakeShortcodeHelper(names, useElement) {
  const func = {
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {type: 'Identifier', name: 'makeShortcode'},
        init: {
          type: 'ArrowFunctionExpression',
          id: null,
          expression: true,
          generator: false,
          async: false,
          params: [{type: 'Identifier', name: 'name'}],
          body: {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [{type: 'Identifier', name: 'props'}],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: {type: 'Identifier', name: 'console'},
                      property: {type: 'Identifier', name: 'warn'},
                      computed: false,
                      optional: false
                    },
                    arguments: [
                      {
                        type: 'Literal',
                        value:
                          'Component `%s` was not imported, exported, or provided by MDXProvider as global scope'
                      },
                      {type: 'Identifier', name: 'name'}
                    ]
                  }
                },
                {
                  type: 'ReturnStatement',
                  argument: useElement
                    ? {
                        type: 'JSXElement',
                        openingElement: {
                          type: 'JSXOpeningElement',
                          attributes: [
                            {
                              type: 'JSXSpreadAttribute',
                              argument: {type: 'Identifier', name: 'props'}
                            }
                          ],
                          name: {type: 'JSXIdentifier', name: 'div'},
                          selfClosing: true
                        },
                        closingElement: null,
                        children: []
                      }
                    : {
                        type: 'JSXFragment',
                        openingFragment: {type: 'JSXOpeningFragment'},
                        closingFragment: {type: 'JSXClosingFragment'},
                        children: [
                          {
                            type: 'JSXExpressionContainer',
                            expression: {
                              type: 'MemberExpression',
                              object: {type: 'Identifier', name: 'props'},
                              property: {type: 'Identifier', name: 'children'},
                              computed: false
                            }
                          }
                        ]
                      }
                }
              ]
            }
          }
        }
      }
    ],
    kind: 'const'
  }

  const shortcodes = names.map(name => ({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {type: 'Identifier', name: String(name)},
        init: {
          type: 'CallExpression',
          callee: {type: 'Identifier', name: 'makeShortcode'},
          arguments: [{type: 'Literal', value: String(name)}]
        }
      }
    ],
    kind: 'const'
  }))

  console.log(`>>>> shortcodes: ${shortcodes.length}`)
  return shortcodes.length > 0 ? [func, ...shortcodes] : []
}

export default processEstree
