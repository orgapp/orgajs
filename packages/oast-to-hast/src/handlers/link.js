import u from 'unist-builder'
import mime from 'mime'

module.exports = link

function link(h, node) {
  const { uri, desc } = node
  var props = { href: uri.raw }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, `a`, props, [
    u(`text`, desc)
  ])
}
