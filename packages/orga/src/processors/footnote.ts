// import Node from '../node'

// function process(token, section) {

//   if (section.type === `footnote.definition`) return section // footnote breaks footnote
//   const self = this

//   const parseFootnote = () => {
//     const { label, content } = self.next().data
//     self.prefix = [{ name: `line`, raw: content, data: { content: content.trim() } }]
//     return self.parseSection(new Node(`footnote.definition`).with({ label }))
//   }
//   section.push(parseFootnote())
//   self._aks = {}
//   return self.parseSection(section)
// }

// module.exports = process
