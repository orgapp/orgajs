import defaultOptions, { ParseOptions } from './options'
import { escape } from './utils'
import { parse as parseTimestamp, pattern as timestampPattern } from './timestamp'
import XRegExp from 'xregexp'
import { read } from './reader'
import { tokenize as inlineTok } from './tokenize/inline'
import tokenizeHeadline from './tokenize/headline'
import tokenizePlanning from './tokenize/planning'
import tokenizeBlock from './tokenize/block'
import tokenizeListItem from './tokenize/list'
import tokenizeFootnote from './tokenize/footnote'
import tokenizeDrawer from './tokenize/drawer'
import { isEmpty } from './position'

type Rule = {
  name: string
  pattern: RegExp
  post: (m: any, options?: ParseOptions) => void
}

export interface Lexer {
  next: () => Token | undefined;
  peek: () => Token | undefined;
  all: () => Token[];
}

class Syntax {
  rules: Rule[]

  constructor() {
    this.rules = []
  }

  define(name: string,
         pattern: RegExp,
         post = (_: any, _opitons?: ParseOptions) => { return {} }) : void {
    this.rules.push({
      name,
      pattern,
      post,
    })
  }

  update(name: string, pattern: RegExp) {
    // const i = this.rules.findIndex(r => r.name === name)
    // let newRule = { name, post: (_: any) => {}, pattern: undefined }
    // if (i !== -1) {
    //   newRule = this.rules.splice(i, 1)[0]

    // }
    // newRule.pattern = pattern
    // this.rules.splice(i, 0, newRule)
  }
}

const org = new Syntax()

function headlinePattern(todos = ['TODO', 'DONE']) {
  return RegExp(`^(\\*+)\\s+(?:(${todos.map(escape).join('|')})\\s+)?(?:\\[#(A|B|C)\\]\\s+)?(.*?)\\s*(:(?:[\\w@]+:)+)?$`)
}

org.define('headline', headlinePattern(), m => {
  const level = m[1].length
  const keyword = m[2]
  const priority = m[3]
  const content = m[4]
  const tags = (m[5] || '').split(':').map((str: string) => str.trim()).filter(String)
  return { level, keyword, priority, content, tags }
})

org.define('keyword', /^\s*#\+(\w+):\s*(.*)$/, m => {
  const key = m[1]
  const value = m[2]
  return { key, value }
})

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']
org.define('planning', RegExp(`^\\s*(${PLANNING_KEYWORDS.join('|')}):\\s*(.+)$`), (m, options) => {
  const keyword = m[1]
  return { keyword, ...parseTimestamp(m[2], options) }
})

// org.define('timestamp', XRegExp(timestampPattern, 'i'), (m, options) => {
//   // console.log(options)
//   return parseTimestamp(m, options)
// })

org.define('block.begin', /^\s*#\+begin_(\w+)(.*)$/i, m => {
  const type = m[1]
  const params = m[2].split(' ').map( str => str.trim()).filter(String)
  return { type, params }
})

org.define('block.end', /^\s*#\+end_(\w+)$/i, m => {
  const type = m[1]
  return { type }
})

org.define('drawer.end', /^\s*:end:\s*$/i)

org.define('drawer.begin', /^\s*:(\w+):\s*$/, m => {
  const type = m[1]
  return { type }
})

org.define('list.item', /^(\s*)([-+]|\d+[.)])\s+(?:\[(x|X|-| )\][ \t]+)?(?:([^\n]+)[ \t]+::[ \t]*)?(.*)$/, m => {
  const indent = m[1].length
  const bullet = m[2]
  const tag = m[4]
  const content = m[5]

  let ordered = true
  if ( [`-`, `+`].includes(bullet) ) {
    ordered = false
  }

  const result = {
    indent,
    ordered,
    content,
    tag,
    checked: false }
  if (m[3]) {
    const checked = m[3] !== ' '
    result.checked = checked
  }
  return result
})

org.define('table.separator', /^\s*\|-/)

org.define('table.row', /^\s*\|([^-].*\|.*)\|[ \t]*$/, m => {
  const cells = m[1].split('|').map( str => str.trim())
  return { cells }
})

org.define('horizontalRule', /^\s*-{5,}\s*$/)

org.define('comment', /^\s*#\s.*$/)

org.define('footnote', /^\[fn:(\w+)\]\s+(.*)$/, m => {
  const label = m[1]
  const content = m[2]
  return { label, content }
})

export default class OldLexer {
  syntax: any
  options: ParseOptions

  constructor(options: ParseOptions) {
    this.syntax = org
    this.options = { ...defaultOptions, ...options }
    const { todos } = this.options
    if (todos) {
      this.updateTODOs(todos)
    }
  }

  tokenize(input: string): any {
    for ( const { name, pattern, post } of this.syntax.rules ) {
      const m = pattern.exec(input)
      if (!m) { continue }
      return {
        name,
        raw: input,
        data: post(m, this.options) }
    }

    const trimed = input.trim()
    if (trimed === '') {
      return { name: `blank`, raw: input }
    }

    return { name: `line`, raw: input }
  }

  updateTODOs(todos: string[]) {
    this.syntax.update(`headline`, headlinePattern(todos))
  }
}

export const tokenize = (text: string, options: ParseOptions = defaultOptions) => {

  const { timezone, todos } = { ...defaultOptions, ...options }

  const reader = read(text)

  const {
    isStartOfLine,
    eat,
    getLine,
    getChar,
    now,
    match,
    EOF,
    skipWhitespaces,
  } = reader

  let todoKeywords = todos

  let buffer: Token[] = []

  const tok = (): Token[] => {
    skipWhitespaces()
    if (EOF()) return []

    if (getChar() === '\n') {
      return [{
        name: 'newline',
        position: eat('char'),
      }]
    }

    if (isStartOfLine() && match(/^\*+\s+/)) {
      return tokenizeHeadline({ reader, todoKeywords })
    }

    const l = getLine()
    if (PLANNING_KEYWORDS.some((k) => l.startsWith(k))) {
      return tokenizePlanning({
        reader,
        keywords: PLANNING_KEYWORDS,
        timezone })
    }

    if (l.startsWith('#+')) {

      const keyword = match(/^\s*#\+(\w+):\s*(.*)$/)
      if (keyword) {
        eat('line')
        return [{
          name: 'keyword',
          data: { key: keyword.captures[1], value: keyword.captures[2] },
          position: keyword.position,
        }]
      }

      const block = tokenizeBlock({ reader })
      if (block.length > 0) return block
    }

    const list = tokenizeListItem({ reader })
    if (list.length > 0) return list

    if (l.startsWith('# ')) {
      const comment = eat(/^#\s.*$/)
      if (!isEmpty(comment)) {
        return [ { name: 'comment', position: comment } ]
      }
    }

    const drawer = tokenizeDrawer({ reader })
    if (drawer.length > 0) return drawer
    // TODO: table

    const hr = eat(/^\s*-{5,}\s*$/)
    if (!isEmpty(hr)) {
      return [{
        name: 'hr',
        position: hr,
      }]
    }

    if (now().column === 0) {
      const footnote = tokenizeFootnote({ reader })
      if (footnote.length > 0) return footnote
    }

    // last resort
    return inlineTok({ reader })
  }

  const peek = () : Token | undefined => {
    if (buffer.length === 0) {
      buffer = tok()
    }
    return buffer[0]
  }


  const next = () : Token | undefined => {
    if (buffer.length === 0) {
      buffer = tok()
    }
    return buffer.shift()
  }

  const all = (max: number | undefined = undefined) : Token[] => {
    const tokens: Token[] = []
    let token
    do {
      token = next()
      if (token) {
        tokens.push(token)
      }
      if (max && tokens.length >= max) {
        break
      }
    } while(token)
    return tokens
  }

  return {
    next,
    peek,
    all,
  } as Lexer
}

