import { Headline, Section } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

const match = (array1: string[], array2: string[]): boolean => {
  if (!array1 || !array2) return false
  return array1.filter(i => array2.includes(i)).length > 0
}

export default (context: Context) => (node: Section): HNode => {

  const { selectTags, excludeTags, h } = context

  const headline = node.children.find(n => n.type === 'headline') as Headline
  // if (!headline) return undefined
  if (selectTags.length > 0
    && !match(selectTags, headline.tags)) {
    return undefined
  }
  if (match(excludeTags, headline.tags)) {
    return undefined
  }

  return h('div', { className: ['section'] })(
    ...all(context)(node.children)
  )
}
