import { Element, Node, Text } from 'hast'
import katex from 'katex'
import rehypeParse from 'rehype-parse'
import { unified, type Plugin, type Transformer } from 'unified'
import { visit } from 'unist-util-visit'

const parseHtml = unified().use(rehypeParse, { fragment: true })

const isElement = (node: Node): node is Element => {
  return node.type === 'element'
}

const isText = (node: Node): node is Text => {
  return node.type === 'text'
}

const toText = (node: Node) => {
  if (isText(node)) return node.value
  if (isElement(node)) {
    return node.children.map(toText).filter(Boolean).join()
  }
  return ''
}

const plugin: Plugin = () => {
  const transformer: Transformer = async (tree) => {
    visit(tree, 'element', (element: Element) => {
      const classes =
        element.properties && Array.isArray(element.properties.className)
          ? element.properties.className
          : []
      const inline = classes.includes('math-inline')
      const displayMode = classes.includes('math-display')
      if (!inline && !displayMode) {
        return
      }

      const text = toText(element)
      const result = katex.renderToString(text, {
        displayMode,
        throwOnError: true,
      })

      // @ts-ignore
      element.children = parseHtml.parse(result).children
    })
  }

  return transformer
}

export default plugin
