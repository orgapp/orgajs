import { Element } from 'hast'
import * as _ from 'lodash/fp'
import { Footnote, FootnoteReference, Headline } from 'orga'
import { Transformer } from 'unified'
import { Parent } from 'unist'
import { select } from 'unist-util-select'
import visit, { Visitor } from 'unist-util-visit'

export function leveling(options: { base: number }) {
  const { base } = options

  return (tree, file) => {

    const visitor: Visitor<Headline> = (headline: Headline, index: number, parent: Parent) => {
      if (headline.level === base) {
        parent.children.splice(index, 1)
        return [visit.SKIP, index]
      }
      headline.level = headline.level - base + 1
    }

    visit(tree, 'headline', visitor)
  }

}

export function transform(action: (tree: Parent) => void) {
  return action
}

const getRoot = (node: Parent): Parent => {
  const parent = _.get('parent')(node)
  if (parent) return getRoot(parent)
  return node
}

export const inlineFootnotes = () => {

  const findFootnotes = (root: Parent, label: string): Footnote => {
    const selector = `footnote[label=${label}]`
    return select(selector, root) as Footnote
  }

  const footnotes: Footnote[] = []

  const transformer: Transformer = async (tree: Parent) => {

    const root = getRoot(tree)

    const visitor: Visitor<FootnoteReference> = (node: FootnoteReference, index, parent) => {
      const fn = findFootnotes(root, node.label)
      if (fn) {
        footnotes.push(fn)
      }
    }
    visit(tree, 'footnote.reference', visitor)

    if (footnotes.length > 0) {
      tree.children.push({ type: 'html', value: '<dl id="footnotes">' })
      footnotes.forEach(fn => tree.children.push(fn))
      tree.children.push({ type: 'html', value: '</dl>' })
    }
  }

  return transformer
}

const withClass = (name: string) => _.flow(_.get('properties.className'), _.includes(name))

export const processFootnotes = () => {

  const transformer: Transformer = async (tree: Parent) => {
    const visitor: Visitor<Element> = (node: Element, index, parent) => {

      if (!withClass('footnote')(node)) return

      const label = _.get('properties.dataLabel')(node)

      // node.children.splice(0, 0, {
      //   type: 'element',
      //   tagName: 'sup',
      //   children: [{ type: 'text', value: label }]
      // })
      parent.children.splice(index, 1, {
        type: 'element',
        tagName: 'dd',
        properties: { className: ['footnote-content'] },
        children: [node],
      })
      parent.children.splice(index, 0, {
        type: 'element',
        tagName: 'dt',
        properties: { className: ['footnote-label'] },
        children: [{ type: 'text', value: `[${label}]` }]
      })

      return [visit.SKIP, index + 2]
      // const a = select('element[tagName=a]', node) as Element
      // a.properties['onclick'] = `toggle("fn-${label}")`
      // a.properties['href'] = '#'


      // console.log(inspect(node, false, null, true), { a })
    }
    visit(tree, 'element', visitor)
//     tree.children.push({
//       type: 'element',
//       tagName: 'script',
//       properties: { type: 'text/javascript' },
//       children: [
//         {
//           type: 'text',
//           value: `
// function toggle(id) {
// var e = document.getElementById(id);
// if(e.style.display == 'block')
// e.style.display = 'none';
// else
// e.style.display = 'block';
// }
// `
//         }
//       ],
//     })
  }

  return transformer
}
