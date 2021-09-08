/*
 * This function generate code like the following
 *
 * const makeShortcode = name => props => {
 * console.warn("Component `%s` was not imported, exported, or provided by MDXProvider as global scope", name);
 * return <div {...props} />;
 * };
 * const Box = makeShortcode("Box");
 */
export default function createMakeShortcodeHelper(
  names: string[],
  useElement: boolean
) {
  const func = {
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'makeShortcode' },
        init: {
          type: 'ArrowFunctionExpression',
          id: null,
          expression: true,
          generator: false,
          async: false,
          params: [{ type: 'Identifier', name: 'name' }],
          body: {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [{ type: 'Identifier', name: 'props' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'console' },
                      property: { type: 'Identifier', name: 'warn' },
                      computed: false,
                      optional: false,
                    },
                    arguments: [
                      {
                        type: 'Literal',
                        value:
                          'Component `%s` was not imported, exported, or provided by MDXProvider as global scope',
                      },
                      { type: 'Identifier', name: 'name' },
                    ],
                  },
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
                              argument: { type: 'Identifier', name: 'props' },
                            },
                          ],
                          name: { type: 'JSXIdentifier', name: 'div' },
                          selfClosing: true,
                        },
                        closingElement: null,
                        children: [],
                      }
                    : {
                        type: 'JSXFragment',
                        openingFragment: { type: 'JSXOpeningFragment' },
                        closingFragment: { type: 'JSXClosingFragment' },
                        children: [
                          {
                            type: 'JSXExpressionContainer',
                            expression: {
                              type: 'MemberExpression',
                              object: { type: 'Identifier', name: 'props' },
                              property: {
                                type: 'Identifier',
                                name: 'children',
                              },
                              computed: false,
                            },
                          },
                        ],
                      },
                },
              ],
            },
          },
        },
      },
    ],
    kind: 'const',
  }

  const shortcodes = names.map((name) => ({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: String(name) },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'makeShortcode' },
          arguments: [{ type: 'Literal', value: String(name) }],
        },
      },
    ],
    kind: 'const',
  }))

  return shortcodes.length > 0 ? [func, ...shortcodes] : []
}
