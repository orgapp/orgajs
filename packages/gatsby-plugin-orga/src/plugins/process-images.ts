import { BaseNode, JSXAttribute, Program } from 'estree-jsx'
import { walk } from 'estree-walker'
import { Plugin, Transformer } from 'unified'
import {
  isJSXAttribute,
  isJSXOpeningElement,
  isLiteral,
  isExternalLink,
} from '../tools'

const images: Plugin = (): Transformer => {
  const transformer: Transformer = async (tree: BaseNode) => {
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

    const program = tree as Program
    walk(program, {
      enter(node, parent) {
        if (
          isJSXAttribute(node) &&
          node.name.name === 'src' &&
          isJSXOpeningElement(parent) &&
          isLiteral(node.value) &&
          !isExternalLink(`${node.value.value}`)
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

export default images
