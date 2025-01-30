import { Headline } from 'orga'
import { visit, SKIP } from 'unist-util-visit'

export default (options: { base: number }) => {
  const { base } = options

  return (tree, file) => {
    // @ts-ignore
    visit<Headline>(tree, 'headline', (headline, index, parent) => {
      if ('level' in headline === false) return
      if (headline.level === base) {
        parent.children.splice(index, 1)
        return [SKIP, index]
      }
      headline.level = headline.level - base + 1
    })
  }
}
