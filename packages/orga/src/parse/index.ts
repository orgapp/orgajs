import { Lexer } from '../lexer'
import { newNode, Node } from '../node'
import section from './section'

export const parse = (lexer: Lexer): Node => {
  const tree = newNode('document')
  return section(lexer)(tree)
}
