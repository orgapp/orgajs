import { Reader } from '../reader'
import { Token } from '../types'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { match, eat } = reader

  const drawerReg = /^:(\w+):(?=\s*$)/;
  const m = match(drawerReg);
  if (m) {
    eat(drawerReg);
    const name = m.captures[1]
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
