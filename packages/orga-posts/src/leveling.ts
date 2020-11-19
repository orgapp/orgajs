import { Headline } from 'orga'
import { Parent } from 'unist'
import visit, { Visitor } from 'unist-util-visit'

export default (options: { base: number }) => {
  const { base } = options

  return (tree, file) => {

    const visitor: Visitor<Headline> = (headline: Headline, index: number, parent: Parent) => {
      if (headline.level === base) {
        parent.children.splice(index, 1)
        return [visit.SKIP, index]
      }
      headline.level = headline.level - base + 1
    }

    visit(tree, 'headline', visitor)
  }

}
