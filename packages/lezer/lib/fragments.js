/**
 * @typedef {import('@lezer/common').PartialParse} PartialParse
 * @typedef {import('@lezer/common').Input} Input
 * @typedef {import('@lezer/common').TreeFragment} TreeFragment
 * @typedef {import('@lezer/common').TreeCursor} TreeCursor
 *
 * @typedef TakeNodesResult
 * @property {Tree[]} nodes
 * @property {number[]} positions
 * @property {number} taken
 *
 * @typedef FragmentCursor
 * @property {(pos: number, lineStart: number) => boolean} moveTo
 * @property {(hash: number) => boolean} matches
 * @property {(start: number, ranges: {from: number, to: number}[], rangeI: number) => TakeNodesResult} takeNodes
 */

import { NodeProp, Tree } from '@lezer/common'
import { nodeSet, nodes } from './nodes.js'

/**
 * @param {TreeFragment[]} fragments
 * @param {Input} input
 * @param {(...args: any[]) => void} log
 * @returns {FragmentCursor}
 */
export function fragmentCursor(fragments, input, log) {
  let i = 0
  /** @type {TreeCursor | null} */
  let cursor = null
  /** @type {TreeFragment | null} */
  let fragment = fragments.length ? fragments[i++] : null
  let fragmentEnd = -1

  function nextFragment() {
    fragment = i < fragments.length ? fragments[i++] : null
    cursor = null
    fragmentEnd = -1
  }

  /**
   * move the cursor to the first block after `pos`.
   * @param {number} pos
   * @param {number} lineStart
   */
  function moveTo(pos, lineStart) {
    while (fragment && fragment.to < pos) nextFragment()
    if (!fragment || fragment.from > (pos ? pos - 1 : 0)) {
      return false
    }

    fragmentEnd = fragment.to

    if (fragmentEnd < 0) {
      let end = fragment.to
      while (end > 0 && input.read(end - 1, end) != '\n') end--
      fragmentEnd = end ? end - 1 : 0
    }

    let c = cursor || fragment.tree.cursor()
    if (!cursor) {
      cursor = c
      c.firstChild()
    }
    // if (!c) {
    //   c = cursor = fragment.tree.cursor()
    //   c?.firstChild()
    // }

    let rPos = pos + fragment.offset
    while (c.to <= rPos) if (!c.parent()) return false
    for (;;) {
      if (c.from >= rPos) return fragment.from <= lineStart
      if (!c.childAfter(rPos)) return false
    }
  }

  /**
   * @param {number} hash
   */
  function matches(hash) {
    let tree = cursor?.tree
    return tree ? tree.prop(NodeProp.contextHash) == hash : false
  }

  /**
   * @param {number} start
   * @param {{from: number, to: number}[]} ranges
   * @param {number} rangeI
   * @returns {TakeNodesResult}
   */
  function takeNodes(start, ranges, rangeI) {
    /** @type {TakeNodesResult} */
    const result = {
      nodes: [],
      positions: [],
      taken: 0,
    }

    if (!cursor || !fragment) return result
    let cur = cursor
    let off = fragment.offset
    let end = start
    const fragEnd = fragmentEnd - (fragment.openEnd ? 1 : 0)
    for (;;) {
      if (cur.to - off > fragEnd) {
        if (cur.type.isAnonymous && cur.firstChild()) continue
        log(
          `stop takeNodes from ${cur.name}: fe: ${fragEnd} | ${fragmentEnd}, cur: ${cur.name}, cur.from: ${cur.from}, cur.to: ${cur.to}, off: ${off}`
        )
        break
      }

      let pos = toRelative(cur.from - off, ranges)
      if (cur.to - off <= ranges[rangeI].to) {
        // Fits in current range
        log(
          `Fits in current range, name: ${cur.name}, pos: ${pos}, cur.from: ${cur.from}, cur.to: ${cur.to}`
        )
        const tree = cur.tree

        if (tree) {
          result.nodes.push(tree)
          result.positions.push(pos)
        }
      } else {
        log('create dummy')
        let dummy = new Tree(
          nodeSet.types[nodes.paragraph],
          [],
          [],
          0
          // cx.block.hashProp
        )
        result.nodes.push(dummy)
        result.positions.push(pos)
        // reuse dummy?
      }

      end = cur.to - off
      if (!cur.nextSibling()) break
    }

    result.taken = end - start
    return result
  }

  return {
    moveTo,
    matches,
    takeNodes,
  }
}

/**
 * Convert an input-stream-relative position to a
 * Markdown-doc-relative position by subtracting the size of all input
 * gaps before `abs`.
 * @param {number} abs
 * @param {{from: number, to: number}[]} ranges
 */
function toRelative(abs, ranges) {
  let pos = abs
  for (let i = 1; i < ranges.length; i++) {
    let gapFrom = ranges[i - 1].to,
      gapTo = ranges[i].from
    if (gapFrom < abs) pos -= gapTo - gapFrom
  }
  return pos
}
