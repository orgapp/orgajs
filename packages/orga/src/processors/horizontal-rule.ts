import Node, { NodeType } from '../node'

function process(token, section) {
  this.consume()
  section.push(new Node(NodeType.HorizontalRule))
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
