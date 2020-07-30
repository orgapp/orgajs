import defaultOptions, { ParseOptions } from '../options'
import { isEmpty } from '../position'
import { read } from '../reader'
import todoKeywordSet, { TodoKeywordSet } from '../todo-keyword-set'
import { Token } from '../../types'
import tokenizeBlock from './block'
import tokenizeDrawer from './drawer'
import tokenizeFootnote from './footnote'
import tokenizeHeadline from './headline'
import { tokenize as inlineTok } from './inline'
import tokenizeListItem from './list'
import tokenizePlanning from './planning'
import { Position } from 'unist'

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']

export interface Lexer {
  eat: (type?: string) => Token | undefined;
  peek: () => Token | undefined;
  match: (cond: RegExp | string, offset?: number) => boolean;
  all: () => Token[];
  save: () => number;
  restore: (point: number) => void;
  addInBufferTodoKeywords: (text: string) => void;
  substring: (position: Position) => string;
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
    substring,
  } = reader

  const globalTodoKeywordSets = todos.map(todoKeywordSet)

  const inBufferTodoKeywordSets: TodoKeywordSet[] = []

  const todoKeywordSets = () => {
    return inBufferTodoKeywordSets.length === 0
      ? globalTodoKeywordSets : inBufferTodoKeywordSets
  }

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
      return tokenizeHeadline({
        reader,
        todoKeywordSets: todoKeywordSets(),
      })
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
          key: keyword.captures[1],
          value: keyword.captures[2],
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
        return [ {
          type: 'comment',
          position: comment,
          value: '',
        } ]
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

    match: (cond, offset = 0) => {
      const token = peek()
      if (!token) return false
      if (typeof cond === 'string') {
        return token.type === cond
      }
      return cond.test(token.type)
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

    addInBufferTodoKeywords: (text) => {
      inBufferTodoKeywordSets.push(todoKeywordSet(text))
    },
    substring,

  } as Lexer
}
