import { Lexer } from '../tokenize'
import { newNode, Node } from '../node'
import section from './section'


export type Parse = (lexer: Lexer) => Token | undefined

export const parse = (lexer: Lexer): Node => {
  const tree = newNode('document')
  return section(lexer)(tree)
}
