import Node from '../node'
import { parse as inlineParse } from '../inline'

function process(token, section) {

  var self = this

  const parseList = level => {
    const list = new Node(`list`)
    while (self.hasNext()) {
      const token = self.peek()
      if ( token.name != `list.item` ) break
      const { indent, content, ordered, checked } = token.data
      if (indent <= level) break
      self.consume()
      const item = new Node(`listItem`, [ inlineParse(content) ]).with({ ordered })
      if (checked !== undefined) {
        item.checked = checked
      }
      item.push(parseList(indent))
      list.push(item)
    }
    if (list.children.length > 0) { // list
      list.ordered = list.children[0].ordered
      return list
    }
    return undefined
  }

  section.push(this.unagi(parseList(-1)))
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
