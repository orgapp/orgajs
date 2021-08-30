import defaultOptions, { ParseOptions } from './options'
import { parse as _parse } from './parse'
import { parse as parseTimestamp } from './timestamp'
import { Lexer, tokenize as _tokenize } from './tokenize'
import { Document } from './types'

export * from './types'
export { parseTimestamp, ParseOptions }

export const tokenize = (
  text: string,
  options: Partial<ParseOptions> = {}
): Lexer => {
  return _tokenize(text, { ...defaultOptions, ...options })
}

export const parse = (
  text: string,
  options: Partial<ParseOptions> = {}
): Document => {
  return _parse(tokenize(text, { ...defaultOptions, ...options }))
}
