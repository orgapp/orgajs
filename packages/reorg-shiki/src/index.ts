import { Block } from 'orga'
import { BUNDLED_LANGUAGES, getHighlighter, Lang } from 'shiki'
import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { map } from 'unist-util-map'

interface Options {
  theme: string
  langs: Lang[]
}

const isBlock = (node: Node): node is Block => {
  return node.type === 'block'
}

const plugin: Plugin = ({
  theme = 'github-light',
  langs = [],
}: Partial<Options> = {}) => {
  const transformer: Transformer = async (tree) => {
    const highligher = await getHighlighter({
      theme,
      langs: [...BUNDLED_LANGUAGES, ...langs],
    })

    return map(tree, (node) => {
      if (isBlock(node) && node.name === 'src') {
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
