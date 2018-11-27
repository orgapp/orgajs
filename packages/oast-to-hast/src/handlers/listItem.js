import { all } from '../transform'

export default (h, node) => {
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
