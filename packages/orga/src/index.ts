import defaultOptions from './options'
import { parse as _parse } from './parse'
import { parse as parseTimestamp } from './timestamp'
import { tokenize } from './tokenize'
import { Parent } from './types'

export const parse = (text: string, options = defaultOptions): Parent => {
  return _parse(tokenize(text, options))
}

export {
  parseTimestamp,
  Parent,
}
