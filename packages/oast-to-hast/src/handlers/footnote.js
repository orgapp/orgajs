import u from 'unist-builder'
import { all } from '../transform'

export function definition(h, node) {
  const { label } = node
  const props = {
    id: `fn-${label}`,
    className: `footnote`,
    dataLabel: label,
  }
  return h(node, `div`, props, all(h, node))
}

export function reference(h, node) {
  const { label } = node
  return h(node, `sup`, { id: `fnref-${label}` }, [
    h(node, `a`, { href: `#fn-${label}` }, [
      u(`text`, label)
    ])
  ])
}
