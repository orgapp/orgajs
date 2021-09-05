import { getHighlighter, BUNDLED_LANGUAGES } from 'shiki'
import { Plugin, Transformer } from 'unified'
import map from 'unist-util-map'

const plugin: Plugin = ({ theme = 'github-light', langs = [] } = {}) => {
  const transformer: Transformer = async (tree) => {
    const highligher = await getHighlighter({
      theme,
      langs: [...BUNDLED_LANGUAGES, ...langs],
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
