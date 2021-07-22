import { Keyword } from 'orga'
import { Context, HNode } from '../'

export default (context: Context) =>
  (node: Keyword): HNode => {
    if (node.key.toLowerCase() === 'select_tags') {
      const tags = node.value
        .split(' ')
        .map((v) => v.trim())
        .filter(Boolean)
      context.selectTags = tags
    }
    return undefined
  }
