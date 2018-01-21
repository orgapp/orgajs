const Lexer = require('./lexer')
const Node = require('./node')

function Parser(options = require('./defaults')) {
  this.options = options
  this.lexer = new Lexer(options)
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
    lines = lines.concat(inlineParse(token.data.content))
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

function inlineParse(text) {
  // TODO: inline parsing
  return [ new Node(`text`).with({ value: text }) ]
}

module.exports = Parser
