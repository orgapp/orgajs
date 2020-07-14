import defaultOptions, { ParseOptions } from './options'
import { escape } from './utils'
import { parse as parseTimestamp, pattern as timestampPattern } from './timestamp'
import XRegExp from 'xregexp'
import { read } from './reader'
import { tokenize as inlineTok } from './inline'

type Rule = {
  name: string
  pattern: RegExp
  post: (m: any, options?: ParseOptions) => void
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

export default class Lexer {
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

export const tokenize = (text: string) => {

  const {
    isStartOfLine,
    skipWhitespaces,
    currentChar,
    getLine,
    eatLine,
    match,
    advance,
    EOF,
    position,
    substring,
    isLastLine,
    adv,
  } = read(text)

  let todoKeywords = ['TODO', 'DONE']

  let buffer: Token[] = []

  const generateHeadlinePattern = (todos: string[]) => {
    return RegExp(`^(\\*+)\\s+(?:(${todos.map(escape).join('|')})\\s+)?(?:\\[#(A|B|C)\\]\\s+)?(.*?)\\s*(:(?:[\\w@]+:)+)?$`)
  }

  let headlinePattern = generateHeadlinePattern(todoKeywords)

  const tokenizeHeadline = () => {
    const stars = match(/^\*+(?=\s)/, { advance: true })
    if (!stars) throw Error('not gonna happen')
    buffer.push({
      name: 'stars',
      data: { level: stars.match[0].length },
      position: stars.position,
    })
    skipWhitespaces()
    const keyword = match(RegExp(`^${todoKeywords.map(escape).join('|')}(?=\\s)`), { advance: true })
    if (keyword) {
      buffer.push({
        name: 'keyword',
        position: keyword.position,
      })
    }
    skipWhitespaces()
    const priority = match(/^\[#(A|B|C)\](?=\s)/, { advance: true })
    if (priority) {
      buffer.push({
        name: 'priority',
        position: priority.position,
      })
    }

    skipWhitespaces()
    let content = getLine()

    const tags = match(/\s+(:(?:[\w@]+:)+)[ \t]*$/gm)
    if (tags) {
      console.log('tags:', { tags: tags })
      content = substring({ start: position(), end: tags.position.start }) as string
      // content = content.substring(0, tags.match.index)
    }

    if (content.length === 0) return
    const tokens = inlineTok(content, position())

    buffer = buffer.concat(tokens)

    adv(content.length)

    if (tags) {
      skipWhitespaces()
      buffer.push({
        name: 'tags',
        position: adv(/\s/),
      })
    }
    eatLine()
  }

  const next = () : Token | undefined => {
    if (buffer.length > 0) {
      return buffer.shift()
    }
    if (EOF()) return undefined

    if (getLine().trim() === '') {
      return { name: 'blank', position: eatLine() }
    }

    // skipWhitespaces()

    if (isStartOfLine() && match(/^\*+\s+/)) {
      tokenizeHeadline()
      return next()
    }
    // TODO: planning
    // TODO: drawer
    // TODO: block
    // TODO: settings
    // TODO: list
    // TODO: table
    // TODO: comment
    // TODO: footnote
    // TODO: horizontal rule

    // last resort
    console.log('--------- inline text')
    buffer = inlineTok(getLine(), position())
    eatLine()
    return next()
  }

  const all = () : Token[] => {
    const tokens: Token[] = []
    let token
    do {
      token = next()
      if (token) {
        tokens.push(token)
      }
    } while(token)
    return tokens
  }

  return {
    next,
    all,
  }
}
