import { Node } from 'unist'
import { after, before, isEmpty } from './position'
import { Parent } from './types'
// export default class Node {
//   type: string
//   children: Node[]
//   parent?: Node

//   constructor(type: string, children = []) {
//     this.type = type
//     this.children = []
//     this.push(children)
//   }

//   push(nodes: Node[]): void
//   push(node: Node): void
//   push(node: string): void

//   push(node: any): void {
//     if (Array.isArray(node)) {
//       for (const n of node) {
//         this.push(n)
//       }
//     } else if (node instanceof Node) {
//       node.parent = this
//       this.children.push(node)
//     } else if (typeof node === `string`) {
//       const newNode = new Node(`text`).with({ value: node })
//       newNode.parent = this
//       this.children.push(newNode)
//     }
//   }

//   with(data: object) {
//     let newNode = this
//     newNode = Object.assign(this, data)
//     return newNode
//   }
// }


export const newNode = (type: string): Parent => {
  return {
    type,
    position: {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    },
    children: [],
  }
}

const adjustPosition = (parent: Parent) => (child: Node): void => {
  let dirty = false

  if (!child.position) return
  if (parent.position) {
    const belowLowerBound = before(parent.position.start)
    const aboveUpperBound = after(parent.position.end)

    if (isEmpty(parent.position)) {
      parent.position = { ...child.position }
      dirty = true
    } else if (belowLowerBound(child.position.start)) {
      parent.position.start = child.position.start
      dirty = true
    }else if (aboveUpperBound(child.position.end)) {
      parent.position.end = child.position.end
      dirty = true
    }
  } else {
    parent.position = { ...child.position }
    dirty = true
  }

  if (!!parent.parent && dirty) {
    adjustPosition(parent.parent)(parent)
  }
}


export const push = <P extends Parent>(p: P) => (n: Node): P => {
  adjustPosition(p)(n)
  const node = n as Parent
  if (node) {
    node.parent = p
  }
  p.children.push(n)
  return p
}

export const map = (transform: (node: Parent) => any) => (tree: Parent) => {
  return {
    type: tree.type,
    ...transform(tree),
    children: (tree.children || []).map(map(transform))
  }
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
