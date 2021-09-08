import { Literal } from 'estree'
import { JSXAttribute, JSXOpeningElement, JSXSimpleAttribute } from 'estree-jsx'
import { BaseNode, walk } from 'estree-walker'
import { Plugin, Transformer } from 'unified'

function isJSXOpeningElement(node: BaseNode): node is JSXOpeningElement {
  return node.type === 'JSXOpeningElement'
}

function isJSXAttribute(node: BaseNode): node is JSXSimpleAttribute {
  return node.type === 'JSXAttribute'
}

function isLiteral(node: BaseNode): node is Literal {
  return node.type === 'Literal'
}

export const processImage: Plugin = () => {
  const transformer: Transformer = async (tree, file) => {
    const imports = []

    const _import = (path: string) => {
      const varName = `image${imports.length}`
      imports.push({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: {
              type: 'Identifier',
              name: varName,
            },
          },
        ],
        source: {
          type: 'Literal',
          value: path,
          raw: `'${path}'`,
        },
      })
      return varName
    }

    walk(tree, {
      enter(node, parent) {
        if (
          isJSXAttribute(node) &&
          node.name.name === 'src' &&
          isJSXOpeningElement(parent) &&
          isLiteral(node.value)
        ) {
          const varName = _import(`${node.value.value}`)
          this.replace({
            ...node,
            value: {
              type: 'JSXExpressionContainer',
              expression: {
                type: 'Identifier',
                name: varName,
              },
            },
          } as JSXAttribute)
        }
      },
    })

    // @ts-ignore
    tree.body = [...imports, ...tree.body]
  }

  return transformer
}
