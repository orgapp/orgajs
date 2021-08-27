import { Headline } from 'orga'
import { Context } from '../'
import { all } from '../transform'

export default (node: Headline, context: Context) => {
  const { h } = context
  return h(`h${node.level}`)(...all(context)(node.children))
}
