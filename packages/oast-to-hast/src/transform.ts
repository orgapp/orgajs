import { Node, Parent } from 'unist'
import u from 'unist-builder'
import { Context, Handler, HNode } from './'

const unknown = (node: Node, context: Context) => {
  const p = node as Parent
  if (p && p.children) {
    return context.h('div')(...all(context)(p.children))
  } else if ('value' in node) {
    return u('text', `${node['value']}`)
  }
  return undefined
}

export const one =
  <C extends Context>(context: C) =>
  (node: Node): HNode | undefined => {
    const handle = (
      node: Node,
      outcome: Handler | HNode | undefined = undefined
    ) => {
      if (typeof outcome === 'function') {
        return handle(node, outcome(node, context))
      }
      return outcome
    }

    return handle(node, context.handlers[node.type] || unknown)
  }

export const all =
  <C extends Context>(context: C) =>
  (nodes: Node[]): HNode[] => {
    return nodes.map(one(context)).filter(Boolean)
  }
