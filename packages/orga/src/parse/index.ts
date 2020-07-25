import { newNode } from '../node'
import { Lexer } from '../tokenize'
import { Parent } from '../types'
import section from './section'


export type Parse = (lexer: Lexer) => Parent | undefined

export const parse = (lexer: Lexer): Parent => {
  const tree = newNode('document')
  return section(lexer)(tree)
}
