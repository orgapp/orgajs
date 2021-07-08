import { Reader } from '../reader'
import { Token } from '../types'
import { tokenize as tokenizeInline } from './inline'
import { tokTableColumnSeparator, tokTableRule } from './util';

export default ({ reader }: { reader: Reader }): Token[] => {
  const { match, eat, getChar, jump } = reader

  if (getChar() !== '|') return []

  if (getChar(1) === '-') {
    return [tokTableRule({ position: eat('line').position })];
  }

  let tokens: Token[] = [tokTableColumnSeparator({
    position: eat('char').position,
  })];

  const tokCells = (): void => {
    const m = match(/\|/)
    const end = m && m.position.start
    tokens = tokens.concat(tokenizeInline({ reader, end }))
    if (!m) return
    tokens.push(tokTableColumnSeparator({ position: m.position }));
    jump(m.position.end)
    tokCells()
  }

  tokCells()


  return tokens
}
