const Lexer = require('./lexer')
const Node = require('./node')

function Parser(options) {
  this.options = options
  this.lexer = new Lexer()
}

Parser.prototype.peek = function() {
  return this.tokens[this.cursor + 1]
}

Parser.prototype.hasNext = function() {
  return this.cursor < this.tokens.length
}

Parser.prototype.consume = function() {
  this.cursor++
}

Parser.prototype.next = function() {
  this.consume()
  return this.tokens[this.cursor]
}

Parser.prototype.tryTo = function(process) {
  const restorePoint = this.cursor
  const result = process.bind(this)()
  if (result) { return result }
  this.cursor = restorePoint
  return result
}

Parser.prototype.parse = function(string) {
  this.document = new Node('root').with({ settings: {} })
  this.cursor = -1
  this.restorePoint = -1
  this.tokens = string.split('\n').map(this.lexer.tokenize)
  const doc = this.parseDocument()
  return doc
}

Parser.prototype.parseDocument = function() {
  const token = this.peek()
  if (!token) { return this.document }
  switch(token.name) {
  case 'keyword':
    this.processKeyword()
    break
  case 'headline':
    const headline = this.parseHeadline()
    this.document.children.push(headline)
    break
  case 'line':
    const paragraph = this.parseParagraph()
    this.document.children.push(paragraph)
  default:
    this.consume()
    // this.children.push({ type: 'dummy', data: token.data })
  }
  return this.parseDocument()
}


Parser.prototype.processKeyword = function() {
  const token = this.next()
  const { key, value } = token.data
  switch (key) {
  case `TITLE`:
    this.document.settings.title = value
    break
  case `TODO`:
    this.document.settings.todo = value
    break
  }
}

Parser.prototype.parseHeadline = function() {
  const token = this.next()
  const { level, keyword, priority, tags, content } = token.data
  // TODO: inline parse content
  const text = new Node(`text`).with({ value: content })
  var headline = new Node('headline', [text]).with({
    level, keyword, priority, tags
  })
  const planning = this.tryTo(parsePlanning)
  if (planning) {
    console.log(planning)
    headline.children.push(planning)
  }

  do {
    let drawer = this.tryTo(parseDrawer)
    if (!drawer) break
    headline.children.push(drawer)
  } while (true)

  return headline
}

Parser.prototype.parseParagraph = function() {
  var lines = []
  do {
    const token = this.peek()
    if (token.name != `line`) break
    this.consume()
    // TODO: inline parsing
    lines.push(new Node(`text`).with({ value: token.data.content }))
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
  if (!begin || begin.name != `drawer.begin`) { return undefined }
  var lines = []
  while (this.hasNext()) {
    const t = this.next()
    if ( t.name === `headline` ) { return undefined }
    if (t.name === `drawer.end` ) {
      return new Node('drawer').with({ name: begin.data.type, content: lines })
    }
    lines.push(t.raw)
  }
  return undefined
}

module.exports = Parser
