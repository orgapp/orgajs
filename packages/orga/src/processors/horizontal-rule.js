const Node = require('../node')

function process(token, section) {
  this.consume()
  section.push(new Node(`horizontalRule`))
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
