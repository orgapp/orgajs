import { Reader } from 'text-kit'
import { Token } from '../types'
import { tokenize as tokenizeInline } from './inline'

export default (reader: Reader): Token[] => {
  const { match, eat, getChar, jump } = reader

  if (getChar() !== '|') return []

  if (getChar(1) === '-') {
    return [{ type: 'table.hr', position: eat('line').position }]
  }

  const tokens: Token[] = [
    {
      type: 'table.columnSeparator',
      position: eat('char').position,
    },
  ]

  const tokCells = (): void => {
    const m = match(/\|/)
    const end = m && m.position.start
    const inline = tokenizeInline(reader.read({ end }))
    tokens.push(...inline)
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
