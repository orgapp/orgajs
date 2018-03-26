module.exports = section

import { all } from '../transform'

const match = (left, right) => {
  return left.some(e => right.includes(e))
}

function section(h, node) {
  const props = { className: `section` }
  const headline = node.children.find(
    n => n.type === `headline`
  )

  function shouldExclude(headline) {
    if (!headline) return false
    if (h.selectTags.length > 0) {
      return !match(headline.tags, h.selectTags)
    }

    return match(headline.tags, h.excludeTags)
  }

  if (shouldExclude(headline)) return undefined
  return h(node, `div`, props, all(h, node))
}
