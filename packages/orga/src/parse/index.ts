import { newNode } from '../node'
import { Lexer } from '../tokenize'
import { Parent, Token } from '../types'
import section from './section'


export type Parse = (lexer: Lexer) => Token | undefined

export const parse = (lexer: Lexer): Parent => {
  const tree = newNode('document')
  return section(lexer)(tree)
}
