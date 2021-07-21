import { Element } from 'hast'
import * as _ from 'lodash/fp'
import { Transformer } from 'unified'
import visit, { Visitor } from 'unist-util-visit'

const withClass = (name: string) => _.flow(_.get('properties.className'), _.includes(name))

export default () => {

  const transformer: Transformer = (tree) => {
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
    }
    // @ts-ignore FIXME
    visit(tree, 'element', visitor)
  }

  return transformer
}
