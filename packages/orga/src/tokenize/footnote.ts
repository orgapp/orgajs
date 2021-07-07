import { Reader } from '../reader'
import { Token } from '../types'
import { tokenize as tokenizeInline } from './inline'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { match, jump, eat } = reader
  let tokens: Token[] = []
  const m = match(/^\[fn:([^\]]+)\]/)
  if (!m) return []
  tokens.push({
    type: 'footnote.label',
    label: m.captures[1],
    position: m.position,
  })
  jump(m.position.end)
  eat('whitespaces')

  tokens = tokens.concat(tokenizeInline({ reader }))

  return tokens
}
