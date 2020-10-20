import { Footnote, FootnoteReference } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

export const footnoteReference = ({ h, u }: Context) => (node: FootnoteReference): HNode => {
  return h('sup', { id: `fnref-${node.label}` })(
    h('a', { href: `#fn-${node.label}` })(
      u('text', node.label)
    )
  )
}

export const footnote = (context: Context) => (node: Footnote): HNode => {
  const { h } = context
  return h('div', {
    id: `fn-${node.label}`,
    className: ['footnote'],
    dataLabel: node.label,
  })(
    ...all(context)(node.children)
  )

}
