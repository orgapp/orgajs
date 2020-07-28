import Node, { NodeType } from '../node'
const inlineParse = require('../inline').parse

function process(token, section) {

  const self = this

  const parseTable = () => {
    const table = new Node(NodeType.Table)
    while (self.hasNext()) {
      const token = self.peek()
      if ( !token.name.startsWith(`table.`) ) break
      self.consume()
      if (token.name === `table.separator`) {
        table.push(new Node(NodeType.TableSeparator))
        continue
      }
      if ( token.name !== `table.row` ) break
      const cells = token.data.cells.map(c => new Node(NodeType.TableCell, inlineParse(c)))
      const row = new Node(NodeType.TableRow, cells)
      table.push(row)
    }
    return table
  }

  const table = this.unagi(parseTable())
  section.push(table)

  return this.parseSection(section)
}

module.exports = process
