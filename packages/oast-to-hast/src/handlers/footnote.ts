import { Footnote, FootnoteReference } from 'orga'
import { Context } from '../'

export const footnoteReference = (
  node: FootnoteReference,
  { h, u }: Context
) => {
  return h('sup', {
    id: `fnr-${node.label}`,
    className: ['footnote-ref'],
    dataLabel: node.label,
  })(h('a', { href: `#fn-${node.label}` })(u('text', `[${node.label}]`)))
}

export const footnote = (node: Footnote, context: Context) => {
  const { h, all } = context
  return h('div', {
    id: `fn-${node.label}`,
    className: ['footnote'],
    dataLabel: node.label,
  })(...all(node.children, context))
}
