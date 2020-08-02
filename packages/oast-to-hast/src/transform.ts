import { Element, Comment, Text } from 'hast'
// import { Parent } from 'orga'
import { Node, Parent } from 'unist'
import u from 'unist-builder'
import { Context, HNode } from './'
import { getHandler } from './handlers'

// function unknown(h, node) {
//   if (text(node)) {
//     return u('text', node.value)
//   }

//   return h(node, 'div', all(h, node))
// }

// export const _transform({ node }) => {
//   const
// }

// export function transform(h, node, parent?) {
//   const type = node && node.type
//   const fn = h.handlers.hasOwnProperty(type) ? h.handlers[type] : null

//   /* Fail on non-nodes. */
//   if (!type) {
//     throw new Error('Expected node, got `' + node + '`')
//   }

//   return (typeof fn === 'function' ? fn : unknown)(h, node, parent)
// }

export function all(h, parent) {
  const nodes = parent.children || []
  const length = nodes.length
  let values = []
  let index = -1
  let result

  // while (++index < length) {
  //   result = transform(h, nodes[index], parent)

  //   if (result) {
  //     values = values.concat(result)
  //   }
  // }

  return values
}

export const _all = (context: Context) => (nodes: Node[]): HNode[] => {
  return nodes.map(one(context)).filter(Boolean)
}

const unknown = (context: Context) => (node: Node): Element => {
  // if (node.type === 'text') {
  //   return u('text', node.value)
  // }
  const p = node as Parent
  if (p && p.children) {
    return context.build({
      tagName: 'div',
      children: _all(context)(p.children) })
  } else if ('value' in node) {
    return u('text', node.value)
  }
  return undefined
}

export const one = (context: Context) => (node: Node): HNode => {
  const handler = getHandler(node.type)
  return (handler || unknown)(context)(node)
}
