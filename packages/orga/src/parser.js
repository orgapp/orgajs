const Lexer = require('./lexer')
const Node = require('./node')

function parse(string) {
  this.document = Object.assign(new Node('root'), { settings: {} })
  this.document = { type: 'root', children: [], settings: {} }
  this.tokens = string.split('\n').map(this.lexer.tokenize)
  this.cursor = -1
  return this.parseDocument()
}

function parseDocument() {
  const token = this.peek()
  if (!token) { return this.document }
  switch(token.name) {
  case 'keyword':
    this.processKeyword()
    break
  case 'headline':
    const headline = buildHeadline(token)
    this.document.children.push(headline)
    this.consume()
    break
  default:
    this.consume()
    context.children.push({ type: 'dummy', data: token.data })
  }
  return this.parseDocument()
}

function processKeyword() {
  const token = this.next()
  const { key, value } = token.data
  console.log(token.data)
  switch (key) {
  case `TITLE`:
    this.document.settings.title = value
    break
  case `TODO`:
    this.document.settings.todo = value
    break
  }
}

function buildHeadline(token) {
  return Object.assign(new Node('headline'), token.data)
}


function parseSection(context) {
  const token = this.peek()
  if (!token) { return context }
  switch (token.name) {
  case 'headline':
    if (token.data.level >= context.data.level) { return context }
    var section = { type: 'section', data: token.data }
    this.consume()
    section = this.parseSection(section)
    context.children = context.children || []
    context.children.push(section)
  default:
    this.consume()
    context.children.push({ type: 'dummy', data: token.data })
  }
  return context
}

function consume() {
  this.cursor++
}

function next() {
  this.consume()
  return this.tokens[this.cursor]
}

function peek() {
  return this.tokens[this.cursor + 1]
}

// function next() {
//   const cursor = this.cursor
//   if (cursor < this.tokens.length) {
//     this.cursor++
//     return this.tokens[cursor]
//   }
//   return undefined
// }

function Parser(options) {
  this.options = options
  this.lexer = new Lexer()
}

Parser.prototype = {
  peek,
  consume,
  next,
  parse,
  parseDocument,
  parseSection,
  processKeyword,
}

// Parser.prototype = {
//   parse,
// }

module.exports = Parser
