import { all } from '../transform'

/* Transform a list. */
export default (h, node) => {
  const props: any = {}
  let name = node.ordered ? 'ol' : 'ul'
  if (node.descriptive) {
    name = 'dl'
  }

  if (typeof node.start === 'number' && node.start !== 1) {
    props.start = node.start
  }

  return h(node, name, props, all(h, node))
}
