import assert from 'assert'
import { Reader } from 'text-kit'
import { Token } from '../types.js'
import { tokenize as tokenizeInline } from './inline/index.js'

export default (reader: Reader): Token[] => {
  const { match, eat, getChar, jump, endOfLine } = reader
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
    const m = match(/(\||\n|$)/m, { end: endOfLine() })
    assert(m, 'what is happening')

    const end = m && m.position.start
    const inline = tokenizeInline(reader.read({ end }))
    tokens.push(...inline)
    jump(m.position.start)
    const c = getChar()
    jump(m.position.end)
    if (!c) return

    tokens.push({
      type: c === '|' ? 'table.columnSeparator' : 'newline',
      position: m.position,
    })

    if (c === '|') tokCells()
  }

  tokCells()

  if (tokens.length === 0) {
    console.log(` >>> empty tokens <<< `)
  }

  return [startColumnSeparator, ...tokens]
}
