import { all } from '../transform'

module.exports = link

function link(h, node) {
  const { path, desc } = node
  var props = { href: path }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, 'a', props, all(h, node))
}
