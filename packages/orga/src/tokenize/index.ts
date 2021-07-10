import defaultOptions, { ParseOptions } from '../options'
import { isEmpty } from '../position'
import { read } from '../reader'
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
import { Position } from 'unist'
import {
  tokComment,
  tokHorizontalRule,
  tokKeyword,
  tokNewline
} from './util';

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']

export interface Lexer {
  /**
   * Consume and return the next token if any.
   *
   * If `type` is provided, then only consume and return the token if
   * it matches the type.
   */
  eat<K extends Token['type']>(): Token | undefined;
  eat<K extends Token['type']>(type: K): Token & { type: K } | undefined;
  eatAll: (type: Token['type']) => number;
  peek: (offset?: number) => Token | undefined;
  match: (cond: RegExp | Token['type'], offset?: number) => boolean;
  all: () => Token[];
  save: () => number;
  restore: (point: number) => void;
  addInBufferTodoKeywords: (text: string) => void;
  substring: (position: Position) => string;
  /** Modify the next token (or the token at the given offset). */
  modify(f: (t: Token) => Token, offset?: number): void;
}

export const tokenize = (text: string, options: Partial<ParseOptions> = {}): Lexer => {

  const { timezone, todos } = { ...defaultOptions, ...options }

  const reader = read(text)

  const state: {
    context: 'verse' | null;
  } = {
    context: null
  };

  const setContext = (context: 'verse') => {
    state.context = context;
  }

  const removeContext = (matchContext: NonNullable<(typeof state)['context']>) => {
    if (state.context === matchContext) {
      state.context = null;
    }
  }

  const {
    isStartOfLine,
    eat,
    getLine,
    getChar,
    now,
    match,
    EOF,
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
    eat('whitespaces')
    if (EOF()) return []

    if (getChar() === '\n') {
      return [tokNewline({ position: eat('char').position })];
    }

    if (isStartOfLine() && match(/^\*+\s+/) && state.context !== 'verse') {
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
        timezone
      })
    }

    if (l.startsWith('#+')) {

      const keyword = match(/^\s*#\+(\w+):\s*(.*)$/)
      if (keyword) {
        eat('line')
        return [tokKeyword(keyword.captures[1], keyword.captures[2],
          { position: keyword.position })];
      }

      const tokBlock = tokenizeBlock({ reader })
      if (tokBlock) {
        const [block, action] = tokBlock;
        // when in a verse block, the only block begin/end that we
        // accept is a verse end - all others are parsed as text
        if (!(state.context === 'verse') || (block.type === 'block.end' && block.name.toUpperCase() === 'VERSE')) {
          if (block.name.toUpperCase() === 'VERSE') {
            // verse blocks can only contain objects, so we adjust the
            // lexer context accordingly
            if (block.type === 'block.begin') {
              setContext('verse');
            } else {
              removeContext('verse');
            }
          }
          action();
          return [block];
        }
      }
    }

    if (state.context !== 'verse') {
      const list = tokenizeListItem({ reader })
      if (list.length > 0) return list
    }

    if (l.startsWith('# ') && state.context !== 'verse') {
      const comment = match(/^#\s+(.*)$/)
      if (comment) {
        eat('line')
        return [tokComment(comment.captures[1], { position: comment.position })];
      }
    }

    const drawer = tokenizeDrawer({ reader })
    if (drawer.length > 0) return drawer
    const table = tokenizeTable({ reader })
    if (table.length > 0) return table

    const hr = eat(/^\s*-{5,}\s*$/).position
    if (!isEmpty(hr)) {
      return [tokHorizontalRule({ position: hr })];
    }

    if (now().column === 1) {
      const footnote = tokenizeFootnote({ reader })
      if (footnote.length > 0) return footnote
    }

    // last resort
    return inlineTok({ reader })
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
    const token = peek(offset);
    if (token !== undefined) {
      tokens[pos] = f(token);
    }
  }

  function _eat<K extends Token['type']>(): Token | undefined;
  function _eat<K extends Token['type']>(type: K): Token & { type: K } | undefined;
  function _eat<K extends Token['type']>(type?: K) {
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
    eatAll: (type: Token['type']): number => {
      let count = 0
      while (_eat(type)) { count += 1 }
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

    restore: (point) => { cursor = point },

    addInBufferTodoKeywords: (text) => {
      inBufferTodoKeywordSets.push(todoKeywordSet(text))
    },
    substring,
    modify
  };
}
