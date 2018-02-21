module.exports = footnote

import u from 'unist-builder'
import { all } from '../transform'

function footnote(h, node) {
  const { label } = node
  const props = {
    id: `fn-${label}`,
    className: `footnote`,
    dataLabel: label,
  }

  // const l = h(node, `span`, [
  //   u(`text`, label)
  // ])
  // const element = [l]
  return h(node, `div`, props, all(h, node))
}
