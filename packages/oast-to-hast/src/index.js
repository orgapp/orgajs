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
  h.handlers = handlers
  return transform(h, tree)
}
