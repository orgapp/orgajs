import { Position } from 'unist'
import { after, before, isEmpty } from './position'
import { Node, Parent } from './types'

const clone = ({ start, end }: Position): Position => ({
  start: { ...start },
  end: { ...end },
})

const adjustPosition = (parent: Parent) => (child: Node): void => {
  let dirty = false

  if (!child.position) return
  if (parent.position) {
    const belowLowerBound = before(parent.position.start)
    const aboveUpperBound = after(parent.position.end)

    if (isEmpty(parent.position)) {
      parent.position = clone(child.position)
      dirty = true
    } else if (belowLowerBound(child.position.start)) {
      parent.position.start = { ...child.position.start }
      dirty = true
    } else if (aboveUpperBound(child.position.end)) {
      parent.position.end = { ...child.position.end }
      dirty = true
    }
  } else {
    parent.position = clone(child.position)
    dirty = true
  }

  if (!!parent.parent && dirty) {
    adjustPosition(parent.parent)(parent)
  }
}


export const push = <P extends Parent>(p: P) => (n: Node & P['children'][number]): P => {
  if (!n) return p
  adjustPosition(p)(n)
  const node = n as Parent
  if (node) {
    node.parent = p
  }
  p.children.push(n)
  return p
}

export const map = (transform: (n: Node) => any) => (node: Node) => {

  const result = {
    type: node.type,
    ...transform(node),
  }

  if ((node as Parent).children) {
    result.children = (node as Parent).children.map(map(transform))
  }
  return result
}

interface DumpContext {
  text: string;
  lines?: string[];
  indent?: number;
}

// export const dump = (text: string, indent: number = 0) => <T extends Parent>(tree: T): string[] => {
//   const { substring } = locate(text)
//   const spaces = '  '.repeat(indent)
//   const line = `${spaces}- ${tree.type}`
//   const rest = tree.children.flatMap(dump(text, indent + 1))
//   return [line].concat(rest)
// }

export const level = (node: Parent): number => {
  let count = 0
  let parent = node.parent
  while (parent) {
    count += 1
    parent = parent.parent
  }
  return count
}
