import { Style, Text } from 'orga'
import { Context, HNode } from '../'

const wrapper: Record<Style, string> = {
  bold: 'strong',
  italic: 'i',
  code: 'code',
  verbatim: 'code',
  underline: 'u',
  strikeThrough: 'del',
  math: 'span',
}

export default (node: Text, context: Context) => {
  const { u, h } = context
  let e: HNode = u('text', node.value)
  if (node.style) {
    e = h(wrapper[node.style], {
      className: node.style === 'math' ? ['math'] : [],
    })(e)
  }
  return e
}
