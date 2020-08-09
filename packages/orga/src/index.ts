import defaultOptions, { ParseOptions } from './options'
import { parse as _parse } from './parse'
import { parse as parseTimestamp } from './timestamp'
import { tokenize } from './tokenize'
import { Document } from './types'

export * from './types'

export const parse = (
  text: string,
  options: Partial<ParseOptions> = {}
): Document => {
  return _parse(tokenize(text, { ...defaultOptions, ...options }))
}

export {
  parseTimestamp,
  ParseOptions,
}
