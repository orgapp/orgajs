import u from 'unist-builder'

function unknown(h, node) {
  if (text(node)) {
    return u('text', node.value)
  }

  return h(node, 'div', all(h, node))
}

export function transform(h, node, parent?) {
  const type = node && node.type
  const fn = h.handlers.hasOwnProperty(type) ? h.handlers[type] : null

  /* Fail on non-nodes. */
  if (!type) {
    throw new Error('Expected node, got `' + node + '`')
  }

  return (typeof fn === 'function' ? fn : unknown)(h, node, parent)
}

export function all(h, parent) {
  const nodes = parent.children || []
  const length = nodes.length
  let values = []
  let index = -1
  let result

  while (++index < length) {
    result = transform(h, nodes[index], parent)

    if (result) {
      values = values.concat(result)
    }
  }

  return values
}

function text(node) {
  const data = node.data || {}

  if (data.hasOwnProperty('hName') ||
      data.hasOwnProperty('hProperties') ||
      data.hasOwnProperty('hChildren') ) {
    return false
  }

  return 'value' in node
}
