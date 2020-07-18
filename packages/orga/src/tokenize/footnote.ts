import { Reader } from '../reader'
import { tokenize as tokenizeInline } from './inline'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { match, jump, skipWhitespaces } = reader
  let tokens: Token[] = []
  const m = match(/^\[fn:([^\]]+)\](?=\s)/)
  if (!m) return []
  tokens.push({
    type: 'footnote.label',
    data: { label: m.captures[1] },
    position: m.position,
  })
  jump(m.position.end)
  skipWhitespaces()

  tokens = tokens.concat(tokenizeInline({ reader }))

  return tokens
}
