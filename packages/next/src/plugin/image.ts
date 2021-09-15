import { JSXAttribute, Program } from 'estree-jsx'
import { BaseNode, walk } from 'estree-walker'
import { Plugin, Transformer } from 'unified'
import { isJSXAttribute, isJSXOpeningElement, isLiteral } from './_estree-utils'

export const processImage: Plugin = () => {
  const transformer: Transformer = async (tree: BaseNode, file) => {
    const program = tree as Program
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

    walk(program, {
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

    program.body.unshift(...imports)
  }

  return transformer
}
