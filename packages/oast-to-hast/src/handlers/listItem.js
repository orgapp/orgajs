module.exports = listItem

import { all } from '../transform'
import { list } from './list'

function listItem(h, node) {
  var props = {}
  var result = all(h, node)
  if (typeof node.checked === `boolean`) {
    result.unshift(h(null, 'input', {
      type: 'checkbox',
      checked: node.checked,
      disabled: true
    }))
  }
  return h(node, 'li', props, result)
}
