import defaultOptions from './options.js'
import type { ParseOptions } from './options.js'
import { parse as _parse } from './parse/index.js'
import { parse as parseTimestamp } from './timestamp.js'
import { Lexer, tokenize as _tokenize } from './tokenize/index.js'
import type { Document } from './types.js'

export * from './types.js'
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
