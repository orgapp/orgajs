import { read } from 'text-kit'
import { Position } from 'unist'
import defaultOptions, { ParseOptions } from '../options'
import todoKeywordSet, { TodoKeywordSet } from '../todo-keyword-set'
import { Token } from '../types'
import tokenizeBlock from './block'
import tokenizeDrawer from './drawer'
import tokenizeFootnote from './footnote'
import tokenizeHeadline from './headline'
import { tokenize as inlineTok } from './inline'
import tokenizeListItem from './list'
import tokenizePlanning from './planning'
import tokenizeTable from './table'

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']

export interface Lexer {
  eat: (type?: string) => Token | undefined
  eatAll: (type: string) => number
  peek: (offset?: number) => Token | undefined
  match: (cond: RegExp | string, offset?: number) => boolean
  all: () => Token[]
  save: () => number
  restore: (point: number) => void
  addInBufferTodoKeywords: (text: string) => void
  substring: (position: Position) => string
  /** Modify the next token (or the token at the given offset). */
  modify(f: (t: Token) => Token, offset?: number): void
}

export const tokenize = (
  text: string,
  options: Partial<ParseOptions> = {}
): Lexer => {
  const { timezone, todos } = { ...defaultOptions, ...options }

  const reader = read(text)

  const { isStartOfLine, now, eat, getLine, getChar, match, substring } = reader

  const globalTodoKeywordSets = todos.map(todoKeywordSet)

  const inBufferTodoKeywordSets: TodoKeywordSet[] = []

  const todoKeywordSets = () => {
    return inBufferTodoKeywordSets.length === 0
      ? globalTodoKeywordSets
      : inBufferTodoKeywordSets
  }

  let tokens: Token[] = []

  let cursor = 0

  const tok = (): Token[] => {
    eat('whitespaces')
    if (!getChar()) return []

    if (getChar() === '\n') {
      return [
        {
          type: 'newline',
          position: eat('char').position,
        },
      ]
    }

    if (reader.isStartOfLine && match(/^\*+\s+/)) {
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
        timezone,
      })
    }

    if (match(/^#\+/)) {
      const keyword = match(/^\s*#\+(\w+):\s*(.*)$/)
      if (keyword) {
        eat('line')
        return [
          {
            type: 'keyword',
            key: keyword.result[1],
            value: keyword.result[2],
            position: keyword.position,
          },
        ]
      }

      const block = tokenizeBlock(reader)
      if (block.length > 0) return block
    }

    const list = tokenizeListItem(reader)
    if (list.length > 0) return list

    if (match(/^#\s/)) {
      const comment = match(/^#\s+(.*)$/)
      if (comment) {
        eat('line')
        return [
          {
            type: 'comment',
            position: comment.position,
            value: comment.result[1],
          },
        ]
      }
    }

    const drawer = tokenizeDrawer(reader)
    if (drawer.length > 0) return drawer
    const table = tokenizeTable(reader)
    if (table.length > 0) return table

    const hr = eat(/^\s*-{5,}\s*$/)
    if (hr) {
      return [
        {
          type: 'hr',
          position: hr.position,
        },
      ]
    }

    if (now().column === 1) {
      const footnote = tokenizeFootnote(reader)
      if (footnote.length > 0) return footnote
    }

    // last resort
    return inlineTok(reader)
  }

  const peek = (offset = 0): Token | undefined => {
    const pos = cursor + offset
    if (pos >= tokens.length) {
      tokens = tokens.concat(tok())
    }
    return tokens[pos]
  }

  const modify = (f: (t: Token) => Token, offset = 0): void => {
    const pos = cursor + offset
    const token = peek(offset)
    if (token !== undefined) {
      tokens[pos] = f(token)
    }
  }

  const _eat = (type: string | undefined = undefined): Token | undefined => {
    const t = peek()
    if (!t) return undefined
    if (!type || type === t.type) {
      cursor += 1
      return t
    }
    return undefined
  }

  return {
    peek,
    eat: _eat,
    eatAll: (type: string): number => {
      let count = 0
      while (_eat(type)) {
        count += 1
      }
      return count
    },
    match: (cond, offset = 0) => {
      const token = peek()
      if (!token) return false
      if (typeof cond === 'string') {
        return token.type === cond
      }
      return cond.test(token.type)
    },

    all: (max: number | undefined = undefined): Token[] => {
      let _all: Token[] = []
      let tokens = tok()
      while (tokens.length > 0) {
        _all = _all.concat(tokens)
        tokens = tok()
      }
      return _all
    },

    save: () => cursor,

    restore: (point) => {
      cursor = point
    },

    addInBufferTodoKeywords: (text) => {
      inBufferTodoKeywordSets.push(todoKeywordSet(text))
    },
    substring: (pos) => reader.substring(pos.start, pos.end),
    modify,
  }
}
