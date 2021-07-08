import { Reader } from '../reader'
import { Token } from '../types'
import { tokDrawerBegin, tokDrawerEnd } from './util';

interface Props {
  reader: Reader;
}

export default ({ reader }: Props): Token[] => {
  const { match, eat } = reader

  const drawerReg = /^:(\w+):(?=\s*$)/;
  const m = match(drawerReg);
  if (m) {
    eat(drawerReg);
    const name = m.captures[1]
    const position = m.position;
    if (name.toLowerCase() === 'end') {
      return [tokDrawerEnd({ position })];
    } else {
      return [tokDrawerBegin(name, { position })];
    }
  }

  return []
}
