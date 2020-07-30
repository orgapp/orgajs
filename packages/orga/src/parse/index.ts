import { Lexer } from '../tokenize'
import { Parent, Document } from '../../types'
import section from './section'


export type Parse = (lexer: Lexer) => Parent | undefined

export const parse = (lexer: Lexer): Document => {
  return section(lexer)({
    type: 'document',
    properties: {},
    children: [] })
}
