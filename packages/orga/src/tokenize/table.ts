import { Reader } from '../reader'
import { Token } from '../../types'
import { tokenize as tokenizeInline } from './inline'

export default ({ reader }: { reader: Reader }) : Token[] => {
  const { match, eat, getChar, jump } = reader

  if (getChar() !== '|') return []

  if (getChar(1) === '-') {
    return [{ type: 'table.hr', position: eat('line') }]
  }

  let tokens: Token[] = [{
    type: 'table.columnSeparator',
    position: eat('char')
  }]

  const tokCells = (): void => {
    const m = match(/\|/)
    const end = m && m.position.start || undefined
    tokens = tokens.concat(tokenizeInline({ reader, end }))
    if (!m) return
    tokens.push({
      type: 'table.columnSeparator',
      position: m.position,
    })
    jump(m.position.end)
    tokCells()
  }

  tokCells()


  return tokens
}
