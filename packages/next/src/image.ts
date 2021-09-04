import { builders as b, namedTypes as n, visit } from 'ast-types'
import { Plugin, Transformer } from 'unified'
import { inspect } from 'util'

// export const processImage: Plugin = () => {
//   const transformer: Transformer = async (tree, file) => {
//     visit(tree, {tagName: 'img'}, (node: Element) => {
//       const src = node.properties.src as string
//       if (!isAbsolute(src)) {
//         const abs = resolve(file.dirname, src)
//         node.properties.src = abs
//       }
//     })
//     // const images = selectAll('[tagName=img]', tree)
//   }

//   return transformer
// }

export const processImage: Plugin = () => {
  const transformer: Transformer = async (tree, file) => {
    const imports = []

    const _import = (path: string) => {
      const varName = `image${imports.length}`
      imports.push(
        b.importDeclaration(
          [b.importDefaultSpecifier(b.identifier(varName))],
          b.literal(path),
          'value'
        )
      )
      return varName
    }

    visit(tree, {
      visitJSXOpeningElement(path) {
        const node = path.node
        if (n.JSXIdentifier.check(node.name) && node.name.name === 'img') {
          console.log(inspect(node, false, null, true))
          for (const attr of node.attributes || []) {
            if (
              n.JSXAttribute.check(attr) &&
              attr.name.name === 'src' &&
              n.Literal.check(attr.value)
            ) {
              const varName = _import(`${attr.value.value}`)
              attr.value = b.jsxExpressionContainer(b.identifier(varName))
            }
          }
        }
        this.traverse(path)
      },
    })

    // @ts-ignore
    tree.body = [...imports, ...tree.body]
  }

  return transformer
}
