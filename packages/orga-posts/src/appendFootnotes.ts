import * as _ from 'lodash/fp'
import { Footnote, FootnoteReference } from 'orga'
import { Transformer } from 'unified'
import { Node } from 'unist'
import { select } from 'unist-util-select'
import visit from 'unist-util-visit'

const getRoot = (node: Node): Node => {
  const parent = _.get('parent')(node)
  if (parent) return getRoot(parent)
  return node
}

export default () => {

  const findFootnotes = (root: Node, label: string): Footnote => {
    const selector = `footnote[label=${label}]`
    return select(selector, root) as Footnote
  }

  const footnotes: Footnote[] = []

  const transformer: Transformer = (tree) => {

    const root = getRoot(tree)

    // @ts-ignore FIXME
    visit<FootnoteReference>(tree, 'footnote.reference', (node) => {
      const fn = findFootnotes(root, node.label)
      if (fn) {
        footnotes.push(fn)
      }
    })

    if (footnotes.length > 0) {
      // @ts-ignore FIXME
      tree.children.push({ type: 'html', value: '<dl id="footnotes">' })
      // @ts-ignore FIXME
      footnotes.forEach(fn => tree.children.push(fn))
      // @ts-ignore FIXME
      tree.children.push({ type: 'html', value: '</dl>' })
    }
  }

  return transformer
}
