import { Element } from 'hast'
import * as _ from 'lodash/fp'
import { Transformer } from 'unified'
import { Parent } from 'unist'
import visit, { Visitor } from 'unist-util-visit'

const withClass = (name: string) => _.flow(_.get('properties.className'), _.includes(name))

export default () => {

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
