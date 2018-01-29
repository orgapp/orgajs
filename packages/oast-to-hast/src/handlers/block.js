module.exports = block

import u from 'unist-builder'
import { all } from '../transform'

function block(h, node) {
  const name = node.name
  if (name.toUpperCase() === `SRC`) {
    var lang = node.params[0]
  }
  var props = {};
  if (lang) {
    props.className = ['language-' + lang];
  }
  var value = node.value || ''
  return h(node, `pre`, [
    h(node, 'code', props, [u('text', value)])
  ])
}
