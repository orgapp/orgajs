import { parse as parseTimestamp } from './timestamp'
import { parse as _parse } from './parse'
import { tokenize } from './tokenize'
import { Node } from './node'

import defaultOptions from './options'

export const parse = (text: string, options = defaultOptions): Node => {
  return _parse(tokenize(text, options))
}

export {
  parseTimestamp,
  Node,
}
