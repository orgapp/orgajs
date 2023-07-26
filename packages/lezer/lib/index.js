/**
 * @typedef {import('@lezer/common').PartialParse} PartialParse
 * @typedef {import('@lezer/common').Input} Input
 * @typedef {import('@lezer/common').TreeFragment} TreeFragment
 */

import { Parser } from '@lezer/common'
import { parseContext } from './context.js'

export class OrgParser extends Parser {
  constructor() {
    super()
  }

  /**
   * @param {Input} input
   * @param {TreeFragment[]} fragments
   * @param {{from: number, to: number}[]} ranges
   * @returns {PartialParse}
   */
  createParse(input, fragments, ranges) {
    console.log('createParse', input, fragments, ranges)
    const parse = parseContext(input, fragments, ranges)
    // const parse = new BlockContext(this, input, fragments, ranges)
    return parse
  }
}

export const parser = new OrgParser()
