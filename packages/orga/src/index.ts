import defaultOptions from './options'
import { parse as _parse } from './parse'
import { parse as parseTimestamp } from './timestamp'
import { tokenize } from './tokenize'
import { Document } from '../types'

export * from '../types'

export const parse = (text: string, options = defaultOptions): Document => {
  return _parse(tokenize(text, options))
}

export {
  parseTimestamp,
}
