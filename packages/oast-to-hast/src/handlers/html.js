module.exports = html

import u from 'unist-builder'

function html(h, node) {
  return u('raw', node.value)
}
