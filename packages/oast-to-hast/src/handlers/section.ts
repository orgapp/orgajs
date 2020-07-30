import { Element } from 'hast'
import { Headline, Section } from 'orga'
import { Context } from '../'
import { _all } from '../transform'

export default (context: Context) => (node: Section): Element => {

  const { selectTags, excludeTags, build } = context

  const headline = node.children.find(n => n.type === 'headline') as Headline
  if (!headline) return undefined
  if (selectTags.length > 0
    && !selectTags.some((headline.tags || []).includes)) {
    return undefined
  }
  if (excludeTags.some((headline.tags || []).includes)) {
    return undefined
  }

  return build({
    tagName: 'div',
    properties: { className: 'section' },
    children: _all(context)(node.children) })
}
