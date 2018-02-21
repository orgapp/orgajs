import Node from '../node'
import { parse as inlineParse } from '../inline'

function process(token, section) {

  var lines = []
  while (this.hasNext()) {
    const token = this.peek()
    // also eats broken block/drawer ends
    if (![`line`, `block.end`, `drawer.end`].includes(token.name)) break
    this.consume()
    lines.push(token.raw.trim())
  }
  const paragraph = new Node(`paragraph`, inlineParse(lines.join(` `)))
  section.push(paragraph)

  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
