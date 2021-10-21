import { Element } from 'hast'
import unified, { Plugin, Transformer } from 'unified'
import visit from 'unist-util-visit'
import katex from 'katex'
import rehypeParse from 'rehype-parse'
import toText from 'hast-util-to-text'

const parseHtml = unified().use(rehypeParse, { fragment: true })

const plugin: Plugin = () => {
  const transformer: Transformer = async (tree) => {
    visit(tree, 'element', (element: Element) => {
      const classes =
        element.properties && Array.isArray(element.properties.className)
          ? element.properties.className
          : []
      if (!classes.includes('math')) return

      const text = toText(element)

      const result = katex.renderToString(text, {
        displayMode: false,
        throwOnError: true,
      })

      // @ts-ignore
      element.children = parseHtml.parse(`${result}`).children
    })
  }

  return transformer
}

export default plugin
