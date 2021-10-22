import { Tokenizer } from '..'
import { Token } from '../../types'

const tokenizeMath: Tokenizer = (reader) => {
  const { now, eat, getChar, jump, substring, match } = reader
  const tokens: Token[] = []
  const tokenStart = now()
  let closingMatch: RegExp | undefined
  if (getChar() === '\\') {
    eat()
    const opening = getChar()
    if (opening === '(') {
      closingMatch = /\\\)/
    } else if (opening === '[') {
      closingMatch = /\\]/
    } else return
    eat()
  } else if (getChar() === '$') {
    eat()
    if (getChar() === '$') {
      eat()
      closingMatch = /\$\$/
    } else return
  }

  if (!closingMatch) return

  const valueStart = now()

  const m = match(closingMatch)
  if (!m) return
  const valueEnd = m.position.start

  jump(m.position.end)
  const tokenEnd = now()

  tokens.push({
    type: 'text',
    style: 'math',
    value: substring(valueStart, valueEnd),
    position: { start: tokenStart, end: tokenEnd },
  })

  return tokens
}

export default tokenizeMath
