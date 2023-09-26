import { Reader } from 'text-kit'
import { Token } from '../types'

export default function ({ isStartOfLine, getLine, eat }: Reader): Token[] {
  const tokens: Token[] = []
  while (isStartOfLine()) {
    const l = getLine()
    if (l === null || l.replace(/\s/g, '').length > 0) break
    const line = eat('line')
    if (!line) break

    tokens.push({
      type: 'emptyLine',
      position: line.position,
    })

    const nl = eat('newline')
    if (!nl) break
    tokens.push({
      type: 'newline',
      position: nl.position,
    })
  }
  return tokens
}
