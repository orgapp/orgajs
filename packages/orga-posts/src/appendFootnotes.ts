import * as _ from 'lodash/fp'
import type { Footnote, FootnoteReference, Parent, HTML } from 'orga'
import type { Transformer, Plugin } from 'unified'
import type { Node } from 'unist'
import { select } from 'unist-util-select'
import { visit } from 'unist-util-visit'

const plugin: Plugin = () => {
  const findFootnotes = (root: Node, label: string): Footnote => {
    const selector = `footnote[label=${label}]`
    return select(selector, root) as Footnote
  }

  const footnotes: Footnote[] = []

  const transformer: Transformer = (tree: Parent) => {
    visit(tree, 'footnote.reference', (node: FootnoteReference) => {
      const fn = findFootnotes(tree, node.label)
      if (fn) {
        footnotes.push(fn)
      }
    })

    if (footnotes.length > 0) {
      tree.children.push({ type: 'html', value: '<dl id="footnotes">' } as HTML)
      footnotes.forEach((fn) => tree.children.push(fn))
      tree.children.push({ type: 'html', value: '</dl>' } as HTML)
    }
  }

  return transformer
}

export default plugin
