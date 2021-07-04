import { Reader } from '../reader'
import { BlockBegin, BlockEnd } from '../types'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props): [BlockBegin | BlockEnd, () => void] | undefined => {
  const { match, eat } = reader

  let m = match(/^\s*#\+begin_([^\s]+)\s*(.*)$/i)
  if (m) {
    const params = m.captures[2].split(' ').map(p => p.trim()).filter(String)
    return [{
      type: 'block.begin',
      name: m.captures[1],
      params,
      position: m.position,
    }, () => eat('line')];
  }

  m = match(/^\s*#\+end_([^\s]+)\s*$/i)
  if (m) {
    return [{
      type: 'block.end',
      position: m.position,
      name: m.captures[1],
    }, () => eat('line')];
  }
}
