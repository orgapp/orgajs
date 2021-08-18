import { Reader } from 'text-kit'
import { Token } from '../types'
import { tokenize as tokenizeInline } from './inline'

export default (reader: Reader): Token[] => {
  const { match, jump, eat } = reader
  let tokens: Token[] = []
  const m = match(/^\[fn:([^\]]+)\](?=\s)/)
  if (!m) return []
  tokens.push({
    type: 'footnote.label',
    label: m.result[1],
    position: m.position,
  })
  jump(m.position.end)
  eat('whitespaces')

  tokens = tokens.concat(tokenizeInline(reader))

  return tokens
}
