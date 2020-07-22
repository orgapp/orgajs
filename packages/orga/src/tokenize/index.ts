import defaultOptions, { ParseOptions } from '../options'
import { escape } from '../utils'
import { parse as parseTimestamp, pattern as timestampPattern } from '../timestamp'
import XRegExp from 'xregexp'
import { read } from '../reader'
import { tokenize as inlineTok } from './inline'
import tokenizeHeadline from './headline'
import tokenizePlanning from './planning'
import tokenizeBlock from './block'
import tokenizeListItem from './list'
import tokenizeFootnote from './footnote'
import tokenizeDrawer from './drawer'
import { isEmpty } from '../position'

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']

export interface Lexer {
  eat: (type?: string) => Token | undefined;
  peek: () => Token | undefined;
  all: () => Token[];
  save: () => number;
  restore: (number) => void;
  setTodoKeywords: (keywords: string[]) => void;
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

  let tokens: Token[] = []

  let cursor = 0

  const tok = (): Token[] => {
    skipWhitespaces()
    if (EOF()) return []

    if (getChar() === '\n') {
      return [{
        type: 'newline',
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
          type: 'keyword',
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
        return [ { type: 'comment', position: comment } ]
      }
    }

    const drawer = tokenizeDrawer({ reader })
    if (drawer.length > 0) return drawer
    // TODO: table

    const hr = eat(/^\s*-{5,}\s*$/)
    if (!isEmpty(hr)) {
      return [{
        type: 'hr',
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
    if (cursor >= tokens.length) {
      tokens = tokens.concat(tok())
    }
    return tokens[cursor]
  }

  return {
    peek,

    eat: (type: string | undefined = undefined) : Token | undefined => {
      const t = peek()
      if (t) {
        if (!type || type === t.type) {
          cursor += 1
        }
      }
      return t
    },

    all: (max: number | undefined = undefined) : Token[] => {
      let _all: Token[] = []
      let tokens = tok()
      while (tokens.length > 0) {
        _all = _all.concat(tokens)
        tokens = tok()
      }
      return _all
    },

    save: () => cursor,

    restore: (point) => { cursor = point },

  } as Lexer
}
