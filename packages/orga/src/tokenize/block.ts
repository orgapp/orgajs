import { Reader } from 'text-kit'
import { Token } from '../types'

export default (reader: Reader): Token[] | void => {
  const { match, eat, endOfLine } = reader

  const b = match(/#\+begin_([^\s\n]+)\s*(.*)$/imy, { end: endOfLine() })
  if (b) {
    eat('line')
    const params = b.result[2]
      .split(' ')
      .map((p) => p.trim())
      .filter(String)
    return [
      {
        type: 'block.begin',
        name: b.result[1],
        params,
        position: { ...b.position },
      },
    ]
  }

  const e = match(/#\+end_([^\s\n]+)\s*$/imy, { end: endOfLine() })
  if (e) {
    reader.eat('line')
    return [
      {
        type: 'block.end',
        name: e.result[1],
        position: { ...e.position },
      },
    ]
  }
}
