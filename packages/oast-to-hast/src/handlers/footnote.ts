import { Footnote, FootnoteReference } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

export const footnoteReference = ({ h, u }: Context) => (node: FootnoteReference): HNode => {
  return h('sup', {
    id: `fnr-${node.label}`,
    className: ['footnote-ref'],
    dataLabel: node.label })(
    h('a', { href: `#fn-${node.label}` })(
      u('text', `[${node.label}]`)
    )
  )
}

export const footnote = (context: Context) => (node: Footnote): HNode => {
  const { h, u } = context
  return h('div', {
    id: `fn-${node.label}`,
    className: ['footnote'],
    dataLabel: node.label,
  })(...all(context)(node.children))

}
