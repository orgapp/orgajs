import { Reader } from 'text-kit'
import { Token } from '../types'

export default (reader: Reader): Token[] => {
  const { match, eat } = reader

  let m = match(/^\s*#\+begin_([^\s]+)\s*(.*)$/i)
  if (m) {
    eat('line')
    const params = m.result[2]
      .split(' ')
      .map((p) => p.trim())
      .filter(String)
    return [
      {
        type: 'block.begin',
        name: m.result[1],
        params,
        position: m.position,
      },
    ]
  }

  m = match(/^\s*#\+end_([^\s]+)\s*$/i)
  if (m) {
    eat('line')
    return [
      {
        type: 'block.end',
        position: m.position,
        name: m.result[1],
      },
    ]
  }

  return []
}
