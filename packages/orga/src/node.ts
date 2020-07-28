export enum NodeType {
  Link = 'link',
  FootnoteReference = 'footnote.reference',
  Text = 'text',
  Root = 'root',
  Block = 'block',
  FootnoteDefinition = 'footnote.definition',
  Planning = 'planning',
  Drawer = 'drawer',
  Timestamp = 'timestamp',
  Headline = 'headline',
  Section = 'section',
  HorizontalRule = 'horizontalRule',
  Html = 'html',
  Paragraph = 'paragraph',
  Table = 'table',
  TableSeparator = 'table.separator',
  TableRow = 'table.row',
  TableCell = 'table.cell',
  Bold = 'bold',
  Verbatim = 'verbatim',
  Italic = 'italic',
  StrikeThrough = 'strikeThrough',
  Underline = 'underline',
  Code = 'code',
  List = 'list',
  ListItem = 'list.item',
}

export default class Node {
  type: NodeType
  children: Node[]
  parent?: Node

  constructor(type: NodeType, children = []) {
    this.type = type
    this.children = []
    this.push(children)
  }

  push(nodes: Node[]): void
  push(node: Node): void
  push(node: string): void

  push(node: Node[] | Node | string): void {
    if (Array.isArray(node)) {
      for (const n of node) {
        this.push(n)
      }
    } else if (node instanceof Node) {
      node.parent = this
      this.children.push(node)
    } else if (typeof node === `string`) {
      const newNode = new Node(NodeType.Text).with({ value: node })
      newNode.parent = this
      this.children.push(newNode)
    }
  }

  with(data: object) {
    let newNode = this
    newNode = Object.assign(this, data)
    return newNode
  }
}

