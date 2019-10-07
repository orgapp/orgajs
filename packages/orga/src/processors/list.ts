import Node from '../node'
const inlineParse = require('../inline').parse

function process(token, section) {

  var self = this

  const parseListItem = () => {
    const { indent, content, ordered, checked, tag } = self.next().data
    var lines = [content]
    const item = new Node(`list.item`).with({ ordered, tag })
    if (checked !== undefined) {
      item.checked = checked
    }
    while (self.hasNext()) {
      const { name, raw } = self.peek()
      if (name !== `line`) break
      const lineIndent = raw.search(/\S/)
      if (lineIndent <= indent) break
      lines.push(self.next().raw.trim())
    }
    item.push(inlineParse(lines.join(` `)))
    return item
  }

  const parseList = level => {
    const list = new Node(`list`)
    while (self.hasNext()) {
      const token = self.peek()
      if ( token.name !== `list.item` ) break
      const { indent } = token.data
      if (indent <= level) break
      const item = parseListItem()
      item.push(parseList(indent))
      list.push(item)
    }
    if (list.children.length > 0) { // list
      list.ordered = list.children[0].ordered
      list.descriptive = typeof list.children[0].tag === `string`
      return list
    }
    return undefined
  }

  section.push(this.unagi(parseList(-1)))
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
