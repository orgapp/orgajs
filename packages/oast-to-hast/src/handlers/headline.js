import { all } from '../transform'

export default (h, node) => {
  const level = node.level
  return h(node, `h${level}`, all(h, node))
}
