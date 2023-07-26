/**
 * @typedef {import('@lezer/common').PartialParse} PartialParse
 * @typedef {import('@lezer/common').Input} Input
 * @typedef {import('@lezer/common').TreeFragment} TreeFragment
 */

import { parse } from 'orga'
import { toLezer } from './oast-to-lezer.js'

/**
 * @param {Input} input
 * @param {TreeFragment[]} fragments
 * @param {{from: number, to: number}[]} ranges
 * @returns {PartialParse}
 */
export function parseContext(input, fragments, ranges) {
  let start = ranges[0].from
  let end = ranges[ranges.length - 1].to
  let stoppedAt = -1

  function advance() {
    const full = input.read(0, input.length)
    const document = parse(full, { range: { start, end } })
    const tree = toLezer(document, null)
    console.log({ document, tree })
    return tree
  }

  return {
    get parsedPos() {
      return end
    },
    advance,
    stopAt() {},
    stoppedAt,
  }
}
