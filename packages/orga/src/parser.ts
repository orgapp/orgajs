import defaultOptions, { ParseOptions } from './options'

import Lexer from './lexer'
import Node from './node'

declare namespace orga {

  interface Parser {
    parse(text: string): Node
  }
}


class OrgaParser implements orga.Parser {
  options: ParseOptions
  lexer: Lexer
  prefix: string[]
  _aks: any
  _cel: number
  processor: any
  cursor: number
  lines: string[]
  tokens: any[]

  constructor(options = defaultOptions) {
    this.options = options
    this.lexer = new Lexer(this.options)
    this.prefix = []
    this._aks = {} // Affiliated Keywords
    this._cel = 0 // Consecutive Empty Lines
    this.processor = require('./processors')
  }

  parse(text: string): Node {
    const self = this
    const document = new Node('root').with({ meta: {} })
    self.cursor = -1
    self.lines = text.split('\n') // TODO: more robust lines?
      self.tokens = []
    return this.parseSection(document)
  }

  peek() {
    if (this.prefix.length > 0) return this.prefix[0]
    return this.getToken(this.cursor + 1)
  }

  hasNext(): boolean {
    return this.prefix.length > 0 || this.cursor + 1 < this.lines.length
  }

  next(): any {
    return this.consume()
  }

  consume() {
    if (this.prefix.length > 0) return this.prefix.shift()
    this.cursor++
    return this.getToken(this.cursor)
  }

  getToken(index: number) {
    const self = this
    if (index >= self.lines.length) { return undefined }
    if (index >= self.tokens.length) {
      const start = self.tokens.length
      for (let i = start; i <= index; i++) {
        self.tokens.push(self.lexer.tokenize(self.lines[i]))
      }
    }
    return self.tokens[index]
  }

  downgradeToLine(index: number) {
    const { raw } = this.tokens[index]
    this.tokens[index] = { name: `line`, raw, data: { content: raw.trim() }}
  }

  tryTo(process) {
    const restorePoint = this.cursor
    const result = process.bind(this)()
    if (result) { return result }
    this.cursor = restorePoint
    return result
  }

// Total Awareness -- according to Ross
  unagi(element) {
    if (Object.keys(this._aks).length === 0) return element
    element.attributes = this._aks
    return element
  }

  parseSection(section: Node): Node {
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
}

export default OrgaParser
