/**
 * @typedef {import('@lezer/common').PartialParse} PartialParse
 * @typedef {import('@lezer/common').Input} Input
 * @typedef {import('@lezer/common').TreeFragment} TreeFragment
 */

import { Parser } from '@lezer/common'
import { parseContext } from './context.js'

export class OrgParser extends Parser {
  constructor(verbose = false) {
    super()
    this.log = function (/** @type {any[]} */ ...args) {
      if (verbose) {
        console.log(...args)
      }
    }
  }

  /**
   * @param {Input} input
   * @param {TreeFragment[]} fragments
   * @param {{from: number, to: number}[]} ranges
   * @returns {PartialParse}
   */
  createParse(input, fragments, ranges) {
    const r = ranges.map((r) => `${r.from}-${r.to}`).join(', ')
    const frags = fragments
      .map(
        (f) => `(${f.from}-${f.to}, offset: ${f.offset}, openEnd: ${f.openEnd})`
      )
      .join(' ')
    this.log('createParse', `ranges: (${r}), frags: [${frags}]`)
    const parse = parseContext(this, input, fragments, ranges)
    return parse
  }
}

export const parser = new OrgParser()
