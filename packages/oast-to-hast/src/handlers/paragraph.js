import { all } from '../transform'

export default (h, node) => {
  return h(node, 'p', all(h, node))
}
