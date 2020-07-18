import { Reader } from '../reader'

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
    return [{
      type: name.toLowerCase() === 'end' ? 'drawer.end' : 'drawer.begin',
      data,
      position: m.position,
    }]
  }

  return []
}
