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

function toHAST(tree, options) {
  const settings = options || {}
  const meta = tree.meta || {}
  h.handlers = Object.assign(handlers, settings.handlers || {})
  h.footnoteSection = settings.footnoteSection || `footnotes`
  const eTags = meta.exclude_tags
  if (eTags) {
    h.excludeTags = eTags.split(/\s+/)
  } else {
    h.excludeTags = settings.excludeTags || [`noexport`]
  }
  const sTags = meta.select_tags
  if (sTags) {
    h.selectTags = sTags.split(/\s+/)
  } else {
    h.selectTags = settings.selectTags || []
  }
  h.highlight = settings.highlight || false
  return transform(h, tree)
}
