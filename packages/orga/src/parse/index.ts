import { Lexer } from '../tokenize'
import { Parent, Document } from '../types'
import document from './document'


export type Parse = (lexer: Lexer) => Parent | undefined

export const parse = (lexer: Lexer): Document => {
  return document(lexer);
}
