import defaultOptions from './options.js'
import type { ParseOptions } from './options.js'
import { parser as _parser, type Parser } from './parse/index.js'
import { parse as parseTimestamp } from './timestamp.js'
import { Lexer, tokenize as _tokenize } from './tokenize/index.js'
import type { Document } from './types.js'

export * from './types.js'
export { parseTimestamp, ParseOptions, Parser }

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
  const parser = makeParser(text, options)
  return parser.parse()
}

export function makeParser(text: string, options: Partial<ParseOptions> = {}) {
  return _parser(tokenize(text, { ...defaultOptions, ...options }))
}
