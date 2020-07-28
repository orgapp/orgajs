import Parser from './parser'
import Node, { NodeType } from './node'
import { parse as parseTimestamp } from './timestamp'

import defaultOptions from './options'

export const parse = (string: string, options = defaultOptions) => {
  const parser = new Parser(options)
  return parser.parse(string)
}

export { Parser }
export { parseTimestamp }
export { Node, NodeType }
