import { Headline, Section } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

export default (context: Context) => (node: Section): HNode => {

  const { selectTags, excludeTags, h } = context

  const headline = node.children.find(n => n.type === 'headline') as Headline
  if (!headline) return undefined
  if (selectTags.length > 0
    && !selectTags.some((headline.tags || []).includes)) {
    return undefined
  }
  if (excludeTags.some((headline.tags || []).includes)) {
    return undefined
  }

  return h('div', { className: 'section' })(
    ...all(context)(node.children)
  )
}
