import { Headline } from 'orga'
import { Context } from '../'

export default (node: Headline, context: Context) => {
  const { h, all } = context
  return h(`h${node.level}`)(...all(node.children, context))
}
