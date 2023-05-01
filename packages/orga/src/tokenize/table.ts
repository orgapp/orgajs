import assert from 'assert'
import { Reader } from 'text-kit'
import { Token } from '../types.js'
import { tokenize as tokenizeInline } from './inline/index.js'

export default (reader: Reader): Token[] => {
  const { match, eat, getChar, jump, endOfLine } = reader
  const char = getChar()

  if (char !== '|') return []

  if (getChar(1) === '-') {
    const hr = eat('line')
    return [{ type: 'table.hr', position: hr.position }]
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
