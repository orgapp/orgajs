const Lexer = require('./lexer')
const Node = require('./node')

function Parser(options = require('./defaults')) {
  this.options = options
  this.lexer = new Lexer(this.options)
  this.prefix = []
  this._aks = {} // Affiliated Keywords
  this._cel = 0 // Consecutive Empty Lines
}

Parser.prototype.peek = function() {
  if (this.prefix.length > 0) return this.prefix[0]
  return this.getToken(this.cursor + 1)
}

Parser.prototype.hasNext = function() {
  return this.prefix.length > 0 || this.cursor + 1 < this.lines.length
}

Parser.prototype.consume = function() {
  if (this.prefix.length > 0) return this.prefix.shift()
  this.cursor++
  return this.getToken(this.cursor)
}

Parser.prototype.next = function() {
  return this.consume()
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

Parser.prototype.processor = require('./processors')

Parser.prototype.parse = function(string) {
  var self = this
  const document = new Node('root').with({ meta: {} })
  self.cursor = -1
  self.lines = string.split('\n') // TODO: more robust lines?
  self.tokens = []
  return this.parseSection(document)
}

/* Total Awareness -- according to Ross */
Parser.prototype.unagi = function(element) {
  if (Object.keys(this._aks).length === 0) return element
  element.attributes = this._aks
  return element
}

Parser.prototype.parseSection = function(section) {
  const token = this.peek()
  if (!token) return section
  if (token.name !== `blank`) this._cel = 0 // reset consecutive empty lines
  const p = this.processor[token.name]
  if (p) {
    return p.bind(this)(token, section)
  }
  this.consume()
  this._aks = {}
  return this.parseSection(section)
}

export default Parser
