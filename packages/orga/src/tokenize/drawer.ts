import { Reader } from '../reader'
import { Token } from '../../types'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { match, eat } = reader

  const m = match(/^:(\w+):(?=\s*$)/)
  if (m) {
    eat('line')
    const name = m.captures[1]
    let data = {}
    if (name.toLowerCase() !== 'end') {
      data = {
        type: name
      }
    }

    if (name.toLowerCase() === 'end') {
      return [{
        type: 'drawer.end',
        position: m.position,
      }]
    } else {
      return [{
        type: 'drawer.begin',
        name,
        position: m.position,
      }]
    }
  }

  return []
}
