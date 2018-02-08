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
  var settings = options || {}
  h.handlers = handlers
  h.highlight = settings.highlight || false
  return transform(h, tree)
}
