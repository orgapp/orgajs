import Lexer from './lexer'
import Node from './node'
import { parse as inlineParse } from './inline'

function Parser(options = require('./defaults')) {
  this.options = options
  this.lexer = new Lexer(options)
}

Parser.prototype.peek = function() {
  return this.tokens[this.cursor + 1]
}

Parser.prototype.hasNext = function() {
  return this.cursor + 1 < this.tokens.length
}

Parser.prototype.consume = function() {
  this.cursor++
}

Parser.prototype.next = function() {
  this.consume()
  return this.tokens[this.cursor]
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
  self.document = new Node('root').with({ settings: {} })
  self.cursor = -1
  self.lines = string.split('\n')
  self.tokens = string.split('\n').map(line => {
    const token = self.lexer.tokenize(line)
    if (token.name == 'keyword') self.processKeyword(token)
    return token
  })
  const doc = self.parseDocument()
  return doc
}

Parser.prototype.parseDocument = function() {
  const token = this.peek()
  if (!token) { return this.document }
  switch(token.name) {
  // case 'keyword':
  //   this.processKeyword()
  //   break
  case 'headline':
    const headline = this.parseHeadline()
    this.document.children.push(headline)
    break
  case 'line':
    const paragraph = this.parseParagraph()
    this.document.children.push(paragraph)
    break
  case `block.begin`:
    const block = this.tryTo(parseBlock)
    if (block) this.document.children.push(block)
    else this.downgradeToLine(this.cursor + 1)
    break
  default:
    this.consume()
    // this.children.push({ type: 'dummy', data: token.data })
  }
  return this.parseDocument()
}


Parser.prototype.processKeyword = function(token) {
  const { key, value } = token.data
  switch (key) {
  case `TITLE`:
    this.document.settings.title = value
    break
  case `TODO`:
    const todos = value.split(/\s|\|/g).filter(String)
    this.document.settings.todos = todos
    this.lexer.updateTODOs(todos)
    break
  }
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
    headline.children.push(planning)
  }

  while (this.hasNext() && this.peek().name == `drawer.begin`) {
    let drawer = this.tryTo(parseDrawer)
    if (!drawer) { // broken drawer
      this.downgradeToLine(this.cursor + 1)
      break
    }
    headline.children.push(drawer)
  }

  return headline
}

Parser.prototype.parseParagraph = function() {
  var lines = []
  do {
    const token = this.peek()
    // also eats broken block/drawer ends
    if (![`line`, `block.end`, `drawer.end`].includes(token.name)) break
    this.consume()
    lines = lines.concat(inlineParse(token.raw.trim()))
  } while (true)

  return new Node(`paragraph`, lines)
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
      return new Node('block').with({ name: type.toUpperCase(), params, value: lines.join(`\n`) })
    }
    lines.push(t.raw)
  }
  return undefined
}

module.exports = Parser
