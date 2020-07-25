import { newNode, push } from '../node'
import { Lexer } from '../tokenize'
import { Parent } from '../types'

export default (lexer: Lexer): Parent[] => {

  const { peek, eat } = lexer

  const all: Parent[] = []

  const parse = (): void => {
    const token = peek()
    if (!token || token.type !== 'planning.keyword') return
    const planning = newNode('planning')
    const collect = push(planning)
    collect(token)
    eat()
    const timestamp = peek()
    if (timestamp && timestamp.type === 'planning.timestamp') {
      collect(timestamp)
      eat()
    }

    all.push(planning)
  }

  parse()
  const nl = peek()
  if (nl && nl.type === 'newline') eat()
  return all
}
