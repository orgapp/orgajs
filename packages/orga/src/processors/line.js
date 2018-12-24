const Node = require('../node')
const inlineParse = require('../inline').parse

function process(token, section) {

  var nodes = []
  while (this.hasNext()) {
    const token = this.peek()
    // also eats broken block/drawer ends
    if (![`line`, `block.end`, `drawer.end`].includes(token.name)) break
    this.consume()
    push(token.raw.trim())
  }
  section.push(new Node(`paragraph`, nodes))

  this._aks = {}
  return this.parseSection(section)

  function push(line) {
    let newNodes = inlineParse(line)
    // merge text newNodes
    if (nodes.length > 0 &&
        nodes[nodes.length - 1].type === `text` &&
        newNodes.length > 0 &&
        newNodes[0].type === `text`) {
      const n = newNodes.shift()
      let last = nodes.pop()
      last.value = `${last.value} ${n.value}`
      nodes.push(last)
    }

    nodes = [...nodes, ...newNodes]
  }
}

module.exports = process
