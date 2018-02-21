module.exports = headline

import { all } from '../transform'

function headline(h, node) {
  const level = node.level
  return h(node, `h${level}`, all(h, node))
}
