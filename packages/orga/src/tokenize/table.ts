import { Reader } from 'text-kit'
import { Token } from '../types.js'
import { tokenize as tokenizeInline } from './inline/index.js'

export default (reader: Reader): Token[] => {
  const { eat, getChar, jump, endOfLine, indexOf } = reader
  const ws = eat('whitespaces')
  const char = getChar()

  if (char !== '|') {
    ws && jump(ws.position.start)
    return []
  }

  if (getChar(1) === '-') {
    const hr = eat('line')
    const tokens: Token[] = [{ type: 'table.hr', position: hr.position }]
    const nl = eat('newline')
    if (nl) tokens.push({ type: 'newline', position: nl.position })
    return tokens
  }

  const startColumnSeparator: Token = {
    type: 'table.columnSeparator',
    position: eat().position,
  }

  const tokens: Token[] = []

  const tokCells = (): void => {
    const pipe = indexOf('|')
    const end = pipe || endOfLine()
    if (!end) throw new Error(`what is happening: ${end}`)

    const inline = tokenizeInline(reader.read({ end }))
    tokens.push(...inline)
    jump(end)

    if (pipe) {
      const c = eat('char')
      tokens.push({
        type: 'table.columnSeparator',
        position: c.position,
      })
      tokCells()
    }

    const nl = eat('newline')
    if (nl) {
      tokens.push({
        type: 'newline',
        position: nl.position,
      })
    }
  }

  tokCells()
  return [startColumnSeparator, ...tokens]
}
