import Parser from './parser'
import { parse as parseTimestamp } from './timestamp'

export const parse = (string: string, options = require('./defaults')) => {
  const parser = new Parser(options)
  return parser.parse(string)
}

export { Parser }
export { parseTimestamp }
