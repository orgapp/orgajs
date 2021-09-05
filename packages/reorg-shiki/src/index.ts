import { getHighlighter } from 'shiki'
import { Plugin, Transformer } from 'unified'
import map from 'unist-util-map'

const plugin: Plugin = () => {
  const transformer: Transformer = async (tree) => {
    const highligher = await getHighlighter({
      theme: 'github-light',
    })

    return map(tree, (node) => {
      if (node.type === 'block' && node.name === 'src') {
        const lang = node.params[0] || 'unkown'
        return {
          type: 'html',
          value: highligher.codeToHtml(`${node.value}`, lang),
        }
      }
      return node
    })
  }

  return transformer
}

export default plugin
