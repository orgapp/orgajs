import { Lexer } from '../lexer'
import { newNode, Node, push } from '../node'

export default (lexer: Lexer): Node[] => {

  const { peek, next } = lexer

  const all: Node[] = []

  const parse = (): void => {
    const token = peek()
    if (!token || token.type !== 'planning.keyword') return
    const planning = newNode('planning')
    const collect = push(planning)
    collect(token)
    next()
    const timestamp = peek()
    if (timestamp && timestamp.type === 'planning.timestamp') {
      collect(timestamp)
      next()
    }

    all.push(planning)
  }

  parse()
  return all
}
