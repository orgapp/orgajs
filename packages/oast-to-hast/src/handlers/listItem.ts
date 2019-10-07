import u from 'unist-builder'
import { all } from '../transform'

export default (h, node, parent) => {
  var props = {}
  const { descriptive } = parent
  var result = all(h, node)
  if (descriptive) {
    return [
      h(node, 'dt', props, [u(`text`, node.tag || '(no item)')]),
      h(node, 'dd', props, result),
    ]
  }
  if (typeof node.checked === `boolean`) {
    result.unshift(h(null, 'input', {
      type: 'checkbox',
      checked: node.checked,
      disabled: true
    }))
  }
  return h(node, 'li', props, result)
}
