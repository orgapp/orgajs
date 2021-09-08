export default (children) => {
  return [
    {
      type: 'FunctionDeclaration',
      id: {
        type: 'Identifier',
        name: 'MDXContent',
      },
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
              key: {
                type: 'Identifier',
                name: 'components',
              },
              kind: 'init',
              value: {
                type: 'Identifier',
                name: 'components',
              },
            },
            {
              type: 'RestElement',
              argument: {
                type: 'Identifier',
                name: 'props',
              },
            },
          ],
        },
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
                    name: {
                      type: 'JSXIdentifier',
                      name: 'components',
                    },
                    value: {
                      type: 'JSXExpressionContainer',
                      expression: {
                        type: 'Identifier',
                        name: 'components',
                      },
                    },
                  },
                  {
                    type: 'JSXSpreadAttribute',
                    argument: {
                      type: 'Identifier',
                      name: 'props',
                    },
                  },
                ],
                name: {
                  type: 'JSXIdentifier',
                  name: 'MDXLayout',
                },
                selfClosing: false,
              },
              closingElement: {
                type: 'JSXClosingElement',
                name: {
                  type: 'JSXIdentifier',
                  name: 'MDXLayout',
                },
              },
              children: children,
            },
          },
        ],
      },
    },
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'MDXContent',
          },
          property: {
            type: 'Identifier',
            name: 'isMDXComponent',
          },
          computed: false,
          optional: false,
        },
        right: {
          type: 'Literal',
          value: true,
          raw: 'true',
        },
      },
    },
  ]
}
