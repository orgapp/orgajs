import { read, Reader } from 'text-kit'
import { Point, Position } from 'unist'
import type { LexerOptions } from '../options.js'
import todoKeywordSet, { TodoKeywordSet } from '../todo-keyword-set.js'
import { Token } from '../types.js'
import block from './block.js'
import latex from './latex.js'
import comment from './comment.js'
import drawer from './drawer.js'
import footnote from './footnote.js'
import headline from './headline.js'
import hr from './hr.js'
import { tokenize as inlineTok } from './inline/index.js'
import keyword from './keyword.js'
import listItem from './list.js'
import planning from './planning.js'
import table from './table.js'
import emptyLines from './empty.js'

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
  readonly now: number
  toOffset: (point: Point | number) => number
  toPoint: (point: number) => Point
}

export type Tokenizer = (reader: Reader) => Token[] | Token | void

export const tokenize = (text: string, options: LexerOptions): Lexer => {
  const { timezone, todos, range } = options
  const reader = read(text, range)
  const { getChar } = reader
  const globalTodoKeywordSets = todos.map(todoKeywordSet)
  const inBufferTodoKeywordSets: TodoKeywordSet[] = []

  function todoKeywordSets() {
    return inBufferTodoKeywordSets.length === 0
      ? globalTodoKeywordSets
      : inBufferTodoKeywordSets
  }

  let tokens: Token[] = []

  let cursor = 0

  const tokenizers: Tokenizer[] = [
    ({ getChar, eat }) =>
      getChar() === '\n' && {
        type: 'newline',
        position: eat('char').position,
      },
    headline(todoKeywordSets),
    drawer,
    planning({ keywords: PLANNING_KEYWORDS, timezone }),
    keyword,
    block,
    latex,
    listItem,
    comment,
    table,
    hr,
    footnote,
  ]

  function tok(): Token[] {
    const all = emptyLines(reader)

    // eat('whitespaces')

    if (!getChar()) return all

    for (const t of tokenizers) {
      const result = t(reader)
      if (!result) continue
      const tokens = Array.isArray(result) ? result : [result]
      if (tokens.length > 0) {
        return [...all, ...tokens]
      }
    }

    // last resort
    const currentLine = reader.read({ end: reader.endOfLine() })
    const inlineTokens = inlineTok(currentLine)
    reader.jump(currentLine.now())
    return [...all, ...inlineTokens]
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
    eatAll(type: string): number {
      let count = 0
      while (_eat(type)) {
        count += 1
      }
      return count
    },
    match(cond, offset = 0) {
      const token = peek()
      if (!token) return false
      if (typeof cond === 'string') {
        return token.type === cond
      }
      return cond.test(token.type)
    },

    all(max: number | undefined = undefined): Token[] {
      let _all: Token[] = []
      let tokens = tok()
      while (tokens.length > 0) {
        _all = _all.concat(tokens)
        tokens = tok()
      }
      return _all
    },

    save: () => cursor,

    restore(point) {
      cursor = point
    },

    addInBufferTodoKeywords(text) {
      inBufferTodoKeywordSets.push(todoKeywordSet(text))
    },
    substring: (pos) => reader.substring(pos.start, pos.end),
    modify,
    get now() {
      const token = peek()
      return reader.toIndex(token?.position.start ?? Infinity)
    },
    toOffset: (point) => reader.toIndex(point),
    toPoint: (offset) => reader.toPoint(offset),
  }
}
