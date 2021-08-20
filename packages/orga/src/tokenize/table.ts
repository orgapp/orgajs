import { Reader } from 'text-kit'
import { Token } from '../types'
import { tokenize as tokenizeInline } from './inline'

export default (reader: Reader): Token[] => {
  const { match, eat, getChar, jump, endOfLine } = reader
  const char = getChar()

  if (char !== '|') return []

  if (getChar(1) === '-') {
    const hr = eat('line')
    return [{ type: 'table.hr', position: hr.position }]
  }

  const tokens: Token[] = [
    {
      type: 'table.columnSeparator',
      position: eat().position,
    },
  ]

  const tokCells = (): void => {
    if (getChar() === '\n') {
      tokens.push({
        type: 'newline',
        position: eat().position,
      })
      return
    }
    const m = match(/\|/, { end: endOfLine() })
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
