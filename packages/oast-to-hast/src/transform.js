import u from 'unist-builder'

module.exports = {
  transform,
  all,
}

function unknown(h, node) {
  if (text(node)) {
    return u('text', node.value)
  }

  return h(node, 'div', all(h, node))
}

function transform(h, node, parent) {
  var type = node && node.type
  var fn = h.handlers.hasOwnProperty(type) ? h.handlers[type] : null

  /* Fail on non-nodes. */
  if (!type) {
    throw new Error('Expected node, got `' + node + '`')
  }

  return (typeof fn === 'function' ? fn : unknown)(h, node, parent)
}

function all(h, parent) {
  var nodes = parent.children || []
  var length = nodes.length
  var values = []
  var index = -1
  var result

  while (++index < length) {
    result = transform(h, nodes[index], parent)

    if (result) {
      values = values.concat(result)
    }
  }

  return values
}

function text(node) {
  var data = node.data || {}

  if (data.hasOwnProperty('hName') ||
      data.hasOwnProperty('hProperties') ||
      data.hasOwnProperty('hChildren') ) {
    return false
  }

  return 'value' in node
}
