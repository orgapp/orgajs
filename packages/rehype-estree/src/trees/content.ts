import { Identifier } from 'estree'

export default (children) => {
  const props = [
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
  ]

  const nodes = [
    {
      type: 'FunctionDeclaration',
      id: {
        type: 'Identifier',
        name: 'OrgaContent',
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
                attributes: props,
                name: {
                  type: 'JSXIdentifier',
                  name: 'OrgaLayout',
                },
                selfClosing: false,
              },
              closingElement: {
                type: 'JSXClosingElement',
                name: {
                  type: 'JSXIdentifier',
                  name: 'OrgaLayout',
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
            name: 'OrgaContent',
          },
          property: {
            type: 'Identifier',
            name: 'isOrgaComponent',
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

  const injectProp = (
    name: string,
    exp: Identifier = { type: 'Identifier', name }
  ) => {
    props.push({
      type: 'JSXAttribute',
      name: {
        type: 'JSXIdentifier',
        name: name,
      },
      value: {
        type: 'JSXExpressionContainer',
        expression: exp,
      },
    })
  }

  const layout = {
    injectProp,
  }

  return { nodes, layout }
}
