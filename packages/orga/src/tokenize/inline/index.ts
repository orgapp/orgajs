import { Reader } from 'text-kit'
import { Tokenizer } from '..'
import { Token } from '../../types'
import tokenizeLink from './link'
import tokenizeText from './text'
import tokenizeMath from './math'
import tokenizeFootnoteRef from './footnote'

const ALL: Tokenizer[] = [
  tokenizeFootnoteRef,
  tokenizeLink,
  tokenizeMath,
  tokenizeText(),
]

export const tokenize = (
  reader: Reader,
  tokenizers: Tokenizer[] = ALL,
  { ignoring }: { ignoring: string[] } = { ignoring: [] }
): Token[] => {
  const { now, eat, jump, substring, getChar, toPoint } = reader

  const _tokens: Token[] = []

  let cursor = now().offset

  const push = (...tokens: Token[]) => {
    if (tokens.length === 0) return
    // collect plain text
    const textEnd = tokens[0].position.start
    if (cursor < textEnd.offset) {
      _tokens.push({
        type: 'text',
        value: substring(cursor, textEnd),
        position: { start: toPoint(cursor), end: { ...textEnd } },
      })
    }

    cursor = tokens[tokens.length - 1].position.end.offset
    _tokens.push(...tokens)
  }

  main: while (getChar()) {
    const newline = eat('newline')
    if (newline) {
      push({
        type: 'newline',
        position: newline.position,
      })
      break // newline breaks inline
    }

    for (const t of tokenizers) {
      const r = reader.read()
      const tokens = t(r)
      if (tokens) {
        push(...(Array.isArray(tokens) ? tokens : [tokens]))
        jump(r.now())
        continue main
      }
    }

    eat()
  }

  if (cursor < now().offset) {
    const value = substring(cursor, reader.now())
    _tokens.push({
      type: 'text',
      value,
      position: { start: toPoint(cursor), end: reader.now() },
    })
  }

  return _tokens
}
