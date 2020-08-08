import { Node, Parent } from 'unist'
import u from 'unist-builder'
import { Context, HNode } from './'

const unknown = (context: Context) => (node: Node): HNode => {
  const p = node as Parent
  if (p && p.children) {
    return context.h('div')(
      ...all(context)(p.children)
    )
  } else if ('value' in node) {
    return u('text', `${node.value}`)
  }
  return undefined
}

export const one = (context: Context) => (node: Node): HNode => {
  return (context.handlers[node.type] || unknown)(context)(node)
}

export const all = (context: Context) => (nodes: Node[]): HNode[] => {
  return nodes.map(one(context)).filter(Boolean)
}
