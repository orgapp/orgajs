import { Element } from 'hast'
import { _all } from '../transform'
import { Headline } from 'orga'
import { Context } from '../'

export default (context: Context) => (node: Headline): Element => {
  return context.build({
    tagName: `h${node.level}`,
    children: _all(context)(node.children)
  })
}
