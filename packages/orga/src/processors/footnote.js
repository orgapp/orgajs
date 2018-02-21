import Node from '../node'
import { parse as inlineParse } from '../inline'

function process(token, section) {

  var self = this

  const parseFootnote = () => {
    const { label, content } = self.next().data
    while (self.hasNext()) {
      // const token = self.peek()
      // if ([''])
    }
    return new Node(`footnote`, inlineParse(content)).with({ label })
  }
  section.push(parseFootnote())
  self._aks = {}
  return self.parseSection(section)
}

module.exports = process
