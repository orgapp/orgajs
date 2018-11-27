import { all } from '../transform'

/* Transform a list. */
export default (h, node) => {
  var props = {}
  var name = node.ordered ? 'ol' : 'ul'

  if (typeof node.start === 'number' && node.start !== 1) {
    props.start = node.start
  }

  return h(node, name, props, all(h, node))
}
