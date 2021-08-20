import { Keyword } from 'orga'
import { Context } from '../'

export default (node: Keyword, context: Context) => {
  if (node.key.toLowerCase() === 'select_tags') {
    const tags = node.value
      .split(' ')
      .map((v) => v.trim())
      .filter(Boolean)
    context.selectTags = tags
  }
  return undefined
}
