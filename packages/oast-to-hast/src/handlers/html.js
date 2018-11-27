import u from 'unist-builder'

export default (h, node) => {
  return u('raw', node.value)
}
