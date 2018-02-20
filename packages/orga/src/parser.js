import Lexer from './lexer'
import Node from './node'
import { parse as inlineParse } from './inline'

function Parser(options = require('./defaults')) {
  this.options = options
  this.lexer = new Lexer(this.options)
  this._aks = {}
}

Parser.prototype.peek = function() {
  return this.getToken(this.cursor + 1)
}

Parser.prototype.hasNext = function() {
  return this.cursor + 1 < this.lines.length
}

Parser.prototype.consume = function() {
  this.cursor++
}

Parser.prototype.next = function() {
  this.consume()
  return this.getToken(this.cursor)
}

Parser.prototype.getToken = function(index) {
  var self = this
  if (index >= self.lines.length) { return undefined }
  if (index >= self.tokens.length) {
    const start = self.tokens.length
    for (var i = start; i <= index; i++) {
      self.tokens.push(self.lexer.tokenize(self.lines[i]))
    }
  }
  return self.tokens[index]
}

Parser.prototype.downgradeToLine = function(index) {
  const { raw } = this.tokens[index]
  this.tokens[index] = { name: `line`, raw, data: { content: raw.trim() }}
}

Parser.prototype.tryTo = function(process) {
  const restorePoint = this.cursor
  const result = process.bind(this)()
  if (result) { return result }
  this.cursor = restorePoint
  return result
}

Parser.prototype.parse = function(string) {
  var self = this
  const document = new Node('root').with({ meta: {} })
  self.cursor = -1
  self.lines = string.split('\n') // TODO: more robust lines?
  self.tokens = []
  return this.parseSection(document)
}

Parser.prototype.processKeyword = function(token, doc) {
  const { key, value } = token.data
  switch (key) {
  case `TODO`:
    if (doc.type != `root`) break
    const todos = value.split(/\s|\|/g).filter(String)
    doc.meta.todos = todos
    this.lexer.updateTODOs(todos)
    break
  case `HTML`:
    doc.push(new Node(`html`).with({ value }))
    break
  case `CAPTION`:
  case `HEADER`:
  case `NAME`:
  case `PLOT`:
  case `RESULTS`:
    this._aks[key] = value
    break
  default:
    if (doc.type === `root`) {
      doc.meta[key.toLowerCase()] = value
    }
    break
  }
  return doc
}

Parser.prototype.parseHeadline = function() {
  const token = this.next()
  const { level, keyword, priority, tags, content } = token.data
  const text = inlineParse(content)
  var headline = new Node('headline', text).with({
    level, keyword, priority, tags
  })
  const planning = this.tryTo(parsePlanning)
  if (planning) {
    headline.push(planning)
  }

  while (this.hasNext() && this.peek().name == `drawer.begin`) {
    let drawer = this.tryTo(parseDrawer)
    if (!drawer) { // broken drawer
      this.downgradeToLine(this.cursor + 1)
      break
    }
    headline.push(drawer)
  }

  return headline
}

/* Total Awareness -- according to Ross */
Parser.prototype.unagi = function(element) {
  if (Object.keys(this._aks).length === 0) return element
  element.attributes = this._aks
  return element
}

Parser.prototype.parseSection = function(section) {
  const token = this.peek()
  if (!token) { return section }
  switch(token.name) {
  case 'keyword':
    section = this.processKeyword(token, section)
    this.consume()
    return this.parseSection(section)
  case 'headline':
    const { level } = token.data
    const currentLevel = section.level || 0
    if (level <= currentLevel) { return section }
    const headline = this.parseHeadline()
    const newSection = new Node(`section`).with({ level })
    newSection.push(headline)
    section.push(this.parseSection(this.unagi(newSection)))
    break
  case 'line':
    const paragraph = this.parseParagraph()
    section.push(paragraph)
    break
  case `block.begin`:
    const block = this.tryTo(parseBlock)
    if (block) section.push(this.unagi(block))
    else this.downgradeToLine(this.cursor + 1)
    break
  case `list.item`:
    section.push(this.unagi(this.parseList(-1)))
    break
  case `table.row`:
    const table = this.unagi(this.parseTable())
    section.push(table)
    break
  case `horizontalRule`:
    this.consume()
    section.push(new Node(`horizontalRule`))
    break
    // TODO: footnote
  default:
    this.consume()
  }
  // remove affiliated keywords
  this._aks = {}
  return this.parseSection(section)
}

Parser.prototype.parseParagraph = function() {
  var lines = []
  do {
    const token = this.peek()
    // also eats broken block/drawer ends
    if (![`line`, `block.end`, `drawer.end`].includes(token.name)) break
    this.consume()
    lines = lines.concat(inlineParse(token.raw.trim()))
  } while (this.hasNext())

  return new Node(`paragraph`, lines)
}

Parser.prototype.parseList = function(level) {
  const list = new Node(`list`)
  var self = this
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
    item.push(self.parseList(indent))
    list.push(item)
  }
  if (list.children.length > 0) { // list
    list.ordered = list.children[0].ordered
    return list
  }
  return undefined
}

Parser.prototype.parseTable = function() {
  const table = new Node(`table`)
  var self = this
  while (self.hasNext()) {
    const token = self.peek()
    if ( !token.name.startsWith(`table.`) ) break
    self.consume()
    if (token.name === `table.separator`) {
      table.push(new Node(`tableSeparator`))
      continue
    }
    if ( token.name != `table.row` ) break
    const cells = token.data.cells.map(c => new Node(`tableCell`, inlineParse(c)))
    const row = new Node(`tableRow`, cells)
    table.push(row)
  }
  return table
}

function parsePlanning() {
  const token = this.next()
  if (!token || token.name != `planning`) { return undefined }
  return new Node('planning').with(token.data)
}

function parseDrawer() {
  const begin = this.next()
  var lines = []
  while (this.hasNext()) {
    const t = this.next()
    if ( t.name === `headline` ) { return undefined }
    if (t.name === `drawer.end` ) {
      return new Node('drawer').with({ name: begin.data.type, value: lines.join(`\n`) })
    }
    lines.push(t.raw)
  }
  return undefined
}

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

module.exports = Parser
