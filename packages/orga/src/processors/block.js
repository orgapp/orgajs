import Node from '../node'

function parseBlock() {
  const t = this.next()
  const { data: { type, params } } = t
  var lines = []
  while (this.hasNext()) {
    const t = this.next()
    if ( t.name === `headline` ) { return undefined }
    if (t.name === `block.end` && t.data.type.toUpperCase() === type.toUpperCase() ) {
      if (t.data.type.toUpperCase() === `EXPORT`) {
        const format = params[0]
        return new Node(format).with({ value: lines.join(`\n`) })
      }
      return new Node('block').with({ name: type.toUpperCase(), params, value: lines.join(`\n`) })
    }
    lines.push(t.raw)
  }
  return undefined
}

function process(token, section) {
  const block = this.tryTo(parseBlock)
  if (block) section.push(this.unagi(block))
  else this.downgradeToLine(this.cursor + 1)
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
