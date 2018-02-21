import Node from '../node'
import { parse as inlineParse } from '../inline'

function process(token, section) {

  var self = this

  const parseFootnote = () => {
    const { label, content } = self.next().data
    var fn = new Node(`footnote`).with({ label })
    self.prefix = [{ name: `line`, raw: content, data: { content: content.trim() } }]
    fn = self.parseSection(fn, [`headline`, `footnote`])
    return fn
  }
  section.push(parseFootnote())
  self._aks = {}
  return self.parseSection(section)
}

module.exports = process
