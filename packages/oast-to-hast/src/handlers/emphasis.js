
import u from 'unist-builder'
import { all } from '../transform'

module.exports = {
  bold: (h, node) => { return h(node, 'strong', all(h, node)) },
  italic: (h, node) => { return h(node, 'i', all(h, node)) },
  code: (h, node) => { return h(node, 'code', all(h, node)) },
  underline: (h, node) => { return h(node, 'u', all(h, node)) },
  verbatim: (h, node) => { return h(node, 'code', all(h, node)) },
  strikeThrough: (h, node) => { return h(node, 'del', all(h, node)) },
}
