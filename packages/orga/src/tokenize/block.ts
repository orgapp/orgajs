import { Reader } from '../reader'
import { BlockBegin, BlockEnd } from '../types'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props): [BlockBegin | BlockEnd, () => void] | undefined => {
  const { match, eat } = reader

  const beginRegex = /^\s*#\+begin_([^\s]+)\s*(.*)$/i;
  let m = match(beginRegex);
  if (m) {
    const params = m.captures[2].split(' ').map(p => p.trim()).filter(String)
    return [{
      type: 'block.begin',
      name: m.captures[1],
      params,
      position: m.position,
    }, () => eat(beginRegex)];
  }

  const endRegex = /^\s*#\+end_([^\s]+)\s*$/i;
  m = match(endRegex);
  if (m) {
    return [{
      type: 'block.end',
      position: m.position,
      name: m.captures[1],
    }, () => eat(endRegex)];
  }
}
