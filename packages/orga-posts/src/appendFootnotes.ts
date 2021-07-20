import * as _ from 'lodash/fp'
import { Footnote, FootnoteReference } from 'orga'
import { Transformer } from 'unified'
import { Parent } from 'unist'
import { select } from 'unist-util-select'
import visit, { Visitor } from 'unist-util-visit'

const getRoot = (node: Parent): Parent => {
  const parent = _.get('parent')(node)
  if (parent) return getRoot(parent)
  return node
}

export default () => {

  const findFootnotes = (root: Parent, label: string): Footnote => {
    const selector = `footnote[label=${label}]`
    return select(selector, root) as Footnote
  }

  const footnotes: Footnote[] = []

  const transformer: Transformer = async (tree: Parent) => {

    const root = getRoot(tree)

    // @ts-ignore
    visit<FootnoteReference>(tree, 'footnote.reference', (node) => {
      const fn = findFootnotes(root, node.label)
      if (fn) {
        footnotes.push(fn)
      }
    })

    if (footnotes.length > 0) {
      // @ts-ignore
      tree.children.push({ type: 'html', value: '<dl id="footnotes">' })
      footnotes.forEach(fn => tree.children.push(fn))
      // @ts-ignore
      tree.children.push({ type: 'html', value: '</dl>' })
    }
  }

  return transformer
}
