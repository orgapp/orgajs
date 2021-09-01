import { Reader } from 'text-kit'
import { Token } from '../types'

export default ({ isStartOfLine, getLine, eat }: Reader): Token[] => {
  const tokens: Token[] = []
  while (isStartOfLine()) {
    const l = getLine()
    if (!l || l.replace(/\s/g, '').length > 0) break
    tokens.push({
      type: 'emptyLine',
      position: eat('line').position,
    })
  }
  return tokens
}
