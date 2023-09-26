import { Reader } from 'text-kit'
import { Token } from '../types'

export default (reader: Reader): Token[] | void => {
  const keyword = reader.match(/#\+(\w+):\s*([^\n]*)$/my)
  if (keyword) {
    reader.eat('line')
    const tokens: Token[] = [
      {
        type: 'keyword',
        key: keyword.result[1],
        value: keyword.result[2],
        position: keyword.position,
      },
    ]
    const nl = reader.eat('newline')
    if (nl) {
      tokens.push({
        type: 'newline',
        position: nl.position,
      })
    }

    return tokens
  }
}
