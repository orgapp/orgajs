import { Reader } from '../reader'
import { Token } from '../types'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { match, eat } = reader

  let m = match(/^\s*#\+begin_([^\s]+)\s*(.*)$/i)
  if (m) {
    eat('line')
    const params = m.captures[2].split(' ').map(p => p.trim()).filter(String)
    return [{
      type: 'block.begin',
      name: m.captures[1],
      params,
      position: m.position,
    }]
  }

  m = match(/^\s*#\+end_([^\s]+)\s*$/i)
  if (m) {
    eat('line')
    return [{
      type: 'block.end',
      position: m.position,
      name: m.captures[1],
    }]
  }

  return []
}
