/**
 * @typedef {import('estree-jsx').Node} Node
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('estree-jsx').Expression} Expression
 * @typedef {import('estree-jsx').ModuleDeclaration} ModuleDeclaration
 * @typedef {any} Options
 */

import { visit, EXIT, SKIP } from 'estree-util-visit'

/**
 * @param {Node} node
 * @returns {node is Program}
 */
function isProgram(node) {
  return node.type === 'Program'
}

/**
 * A plugin to add Astro Fragment to the final component
 *
 * @type {import('unified').Plugin<[], Program>}
 */
export function addAstroFragment() {
  return (tree) => {
    // console.log(inspect(tree, false, null, true))
    tree.body.unshift({
      type: 'ImportDeclaration',
      specifiers: [
        {
          type: 'ImportDefaultSpecifier',
          local: {
            type: 'Identifier',
            name: 'Fragment',
          },
        },
      ],
      source: {
        type: 'Literal',
        value: 'astro/jsx-runtime',
      },
    })

    /** @type {import('estree-jsx').ExportNamedDeclaration} */
    const code = {
      type: 'ExportNamedDeclaration',
      declaration: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'Content',
            },
            init: {
              type: 'ArrowFunctionExpression',
              expression: true,
              generator: false,
              async: false,
              params: [
                {
                  type: 'AssignmentPattern',
                  left: {
                    type: 'Identifier',
                    name: 'props',
                  },
                  right: {
                    type: 'ObjectExpression',
                    properties: [],
                  },
                },
              ],
              body: {
                type: 'CallExpression',
                callee: {
                  type: 'Identifier',
                  name: 'OrgContent',
                },
                arguments: [
                  {
                    type: 'ObjectExpression',
                    properties: [
                      {
                        type: 'SpreadElement',
                        argument: {
                          type: 'Identifier',
                          name: 'props',
                        },
                      },
                      {
                        type: 'Property',
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                          type: 'Identifier',
                          name: 'components',
                        },
                        value: {
                          type: 'ObjectExpression',
                          properties: [
                            {
                              type: 'Property',
                              method: false,
                              shorthand: true,
                              computed: false,
                              key: {
                                type: 'Identifier',
                                name: 'Fragment',
                              },
                              kind: 'init',
                              value: {
                                type: 'Identifier',
                                name: 'Fragment',
                              },
                            },
                            {
                              type: 'SpreadElement',
                              argument: {
                                type: 'MemberExpression',
                                object: {
                                  type: 'Identifier',
                                  name: 'props',
                                },
                                property: {
                                  type: 'Identifier',
                                  name: 'components',
                                },
                                computed: false,
                                optional: false,
                              },
                            },
                          ],
                        },
                        kind: 'init',
                      },
                    ],
                  },
                ],
                optional: false,
              },
            },
          },
        ],
        kind: 'const',
      },
      specifiers: [],
    }

    visit(tree, (node, _key, index, ancestors) => {
      if (ancestors.length === 0 || index === null) return
      const parent = ancestors[ancestors.length - 1]
      if (!isProgram(parent)) return SKIP
      if (
        node.type === 'ExportDefaultDeclaration' &&
        node.declaration.type === 'Identifier'
      ) {
        node.declaration.name = 'Content'
        parent.body.splice(index, 0, code)
        return EXIT
      }
    })
  }
}
