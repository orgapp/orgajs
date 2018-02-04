module.exports = block

import u from 'unist-builder'
import { all } from '../transform'

function block(h, node) {
  const name = node.name.toUpperCase()
  var tag
  var pre = true
  var props = {};
  switch(name) {
  case `SRC`:
    tag = `code`
    const lang = node.params[0]
    if (lang) {
      props.className = ['language-' + lang]
    }
    break
  case `QUOTE`:
    tag = `blockquote`
    pre = false
    break
  case `COMMENT`:
    return undefined
  case `CENTER`:
    pre = false
    tag = `center`
    break
  }

  var result = u('text', node.value || '')
  if (tag) {
    result = h(node, tag, props, [result])
  }
  if (pre) {
    result = h(node, `pre`, [result])
  }
  return result
}
