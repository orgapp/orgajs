import { Headline } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

export default (context: Context) =>
  (node: Headline): HNode => {
    const { h } = context
    return h(`h${node.level}`)(...all(context)(node.children))
  }
