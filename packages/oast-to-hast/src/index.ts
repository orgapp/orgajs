import handlers from './handlers'
import { transform } from './transform'

module.exports = toHAST

function h(node, tagName, props, children) {
  if (
    (children === undefined || children === null) &&
      typeof props === 'object' &&
      'length' in props
  ) {
    children = props
    props = {}
  }

  return {
    type: 'element',
    tagName,
    properties: props || {},
    children: children || []
  }
}

function toHAST(tree, options: any = {}) {
  const meta = tree.meta || {}
  h.handlers = Object.assign(handlers, options.handlers || {})
  h.footnoteSection = options.footnoteSection || `footnotes`
  const eTags = meta.exclude_tags
  if (eTags) {
    h.excludeTags = eTags.split(/\s+/)
  } else {
    h.excludeTags = options.excludeTags || [`noexport`]
  }
  const sTags = meta.select_tags
  if (sTags) {
    h.selectTags = sTags.split(/\s+/)
  } else {
    h.selectTags = options.selectTags || []
  }
  h.highlight = options.highlight || false
  return transform(h, tree)
}
