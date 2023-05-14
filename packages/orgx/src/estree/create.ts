import { Node } from 'estree-jsx'

export function create(from: Node, to: Node) {
  const fields = ['start', 'end', 'loc', 'range', 'comments']
  let index = -1

  while (++index < fields.length) {
    const field = fields[index]

    if (field in from) {
      to[field] = from[field]
    }
  }
}
