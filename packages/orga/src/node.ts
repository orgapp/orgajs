export default class Node {
  type: string
  children: Node[]
  parent?: Node

  constructor(type: string, children = []) {
    this.type = type
    this.children = []
    this.push(children)
  }

  push(nodes: Node[]): void
  push(node: Node): void
  push(node: string): void

  push(node: any): void {
    if (Array.isArray(node)) {
      for (const n of node) {
        this.push(n)
      }
    } else if (node instanceof Node) {
      node.parent = this
      this.children.push(node)
    } else if (typeof node === `string`) {
      var newNode = new Node(`text`).with({ value: node })
      newNode.parent = this
      this.children.push(newNode)
    }
  }

  with(data: object) {
    var newNode = this
    newNode = Object.assign(this, data)
    return newNode
  }
}

