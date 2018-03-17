module.exports = heading

import { all } from '../transform'

function heading(h, node) {
  const level = node.level
  return h(node, `h${level}`, all(h, node))
}
