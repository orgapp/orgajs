import { Headline } from 'orga'
import { Parent } from 'unist'
import visit, { Visitor } from 'unist-util-visit'

export default (options: { base: number }) => {
  const { base } = options

  return (tree, file) => {
    // @ts-ignore
    visit<Headline>(tree, 'headline', (headline, index, parent) => {
      if (headline.level === base) {
        parent.children.splice(index, 1)
        return [visit.SKIP, index]
      }
      headline.level = headline.level - base + 1
    })
  }
}
