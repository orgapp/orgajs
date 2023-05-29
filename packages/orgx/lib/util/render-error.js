/**
 * @param {SyntaxError} error
 * @param {string} bg
 * @param {string} color
 * @returns {import('estree-jsx').Program}
 */
export default (error, bg = '#F44336', color = 'white') => {
  return {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'JSXElement',
          openingElement: {
            type: 'JSXOpeningElement',
            attributes: [
              {
                type: 'JSXAttribute',
                name: {
                  type: 'JSXIdentifier',
                  name: 'style',
                },
                value: {
                  type: 'JSXExpressionContainer',
                  expression: {
                    type: 'ObjectExpression',
                    properties: [
                      {
                        type: 'Property',
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                          type: 'Identifier',
                          name: 'backgroundColor',
                        },
                        value: {
                          type: 'Literal',
                          value: bg,
                          raw: `'${bg}'`,
                        },
                        kind: 'init',
                      },
                      {
                        type: 'Property',
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                          type: 'Identifier',
                          name: 'color',
                        },
                        value: {
                          type: 'Literal',
                          value: color,
                          raw: `'${color}'`,
                        },
                        kind: 'init',
                      },
                    ],
                  },
                },
              },
            ],
            name: {
              type: 'JSXIdentifier',
              name: 'pre',
            },
            selfClosing: false,
          },
          closingElement: {
            type: 'JSXClosingElement',
            name: {
              type: 'JSXIdentifier',
              name: 'pre',
            },
          },
          children: [
            {
              type: 'JSXText',
              value: error.message,
              raw: error.message,
            },
          ],
        },
      },
    ],
    sourceType: 'module',
  }
}
