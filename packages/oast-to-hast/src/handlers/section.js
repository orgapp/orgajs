module.exports = section

import { all } from '../transform'

const match = (left, right) => {
  return left.some(e => right.includes(e))
}

function section(h, node) {
  const props = { className: `section` }
  const heading = node.children.find(
    n => n.type === `heading`
  )

  function shouldExclude(heading) {
    if (!heading) return false
    if (h.selectTags.length > 0) {
      return !match(heading.tags, h.selectTags)
    }

    return match(heading.tags, h.excludeTags)
  }

  if (shouldExclude(heading)) return undefined
  return h(node, `div`, props, all(h, node))
}
