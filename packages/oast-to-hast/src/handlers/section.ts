import { Headline, Section } from 'orga'
import { Context } from '../'

const match = (array1: string[], array2: string[]): boolean => {
  if (!array1 || !array2) return false
  return array1.filter((i) => array2.includes(i)).length > 0
}

export default (node: Section, context: Context) => {
  const { selectTags, excludeTags, h, all } = context

  const headline = node.children.find((n) => n.type === 'headline') as Headline
  // if (!headline) return undefined
  if (headline) {
    if (selectTags.length > 0 && !match(selectTags, headline.tags)) {
      return undefined
    }
    if (match(excludeTags, headline.tags)) {
      return undefined
    }
  }

  return h('div', { className: ['section'] })(...all(node.children, context))
}
