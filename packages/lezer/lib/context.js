/**
 * @typedef {import('@lezer/common').PartialParse} PartialParse
 * @typedef {import('@lezer/common').Input} Input
 * @typedef {import('@lezer/common').TreeFragment} TreeFragment
 * @typedef {import('./fragments.js').FragmentCursor} FragmentCursor
 */

import { makeParser } from 'orga'
import { fragmentCursor } from './fragments.js'
import { nodes } from './nodes.js'
import { toLezer } from './oast-to-lezer.js'
import { treeBuilder } from './tree.js'

/**
 * @param {import('./index.js').OrgParser} config
 * @param {Input} input
 * @param {TreeFragment[]} _fragments
 * @param {{from: number, to: number}[]} ranges
 * @returns {PartialParse}
 */
export function parseContext(config, input, _fragments, ranges) {
  const { log, nodeSet } = config
  let cursor = ranges[0].from
  let end = ranges[ranges.length - 1].to
  let rangeI = 0
  /** @type {number | null} */
  let stoppedAt = null
  const full = input.read(0, input.length)
  /** @type {import('orga').Parser | null} */
  let parser = null

  // const parser = makeParser(full, { range: { start, end } })
  const builder = treeBuilder(nodeSet, nodes.document, 0, cursor, 0, 0)

  const fragments = _fragments.length
    ? fragmentCursor(config, _fragments, input)
    : null

  /**
   * check if we reached the end of the input (ranges)
   * finish the block in parser if exist
   * check if we can reuse a fragment
   * @returns {import('@lezer/common').Tree | null}
   */
  function advance() {
    log('advance called', cursor, end)
    // TODO: should we set an end to the tree?
    // will take a look when this actually happens
    if (stoppedAt != null && cursor > stoppedAt) return builder.build()

    if (cursor >= end) {
      // end of the tree has to match the end of the input
      // sometimes the the chidren does not fill the whole tree
      // which causes the end of the tree to be smaller than the end of the input
      // set it to the end of the input will prevent unnecessary parsing
      return builder.build(end)
    }

    if (fragments !== null && couldReuse(fragments)) {
      const result = fragments.takeNodes(cursor, ranges, rangeI)
      if (result.taken > 0) {
        wrapUpParser()
        builder.addChildren(result.nodes, result.positions)
        cursor += result.taken
        // console.log(`took ${result.taken} from fragments`)
        return null
      } else {
        log('took nothing')
      }
    }

    if (!parser) {
      log('creating parser', cursor, end)
      parser = makeParser(full, { range: { start: cursor, end }, flat: false })
    } else {
      // console.log('moving parser', start, end)
      // parser.move(start, end)
    }

    // parser.advance should finish a block
    const document = parser.advance()
    if (typeof document === 'number') {
      cursor = document
      return null
    }

    wrapUpParser()
    return null
  }

  function wrapUpParser() {
    if (!parser) return
    const document = parser.finish()
    log(
      `wrap up parser: ${document.children.length}, ${document.position?.start.offset}, ${document.position?.end.offset}`,
    )
    log(document)
    const tree = toLezer(document, nodeSet)
    builder.takeChildren(tree, document.position?.start.offset)
    if (document.position?.end.offset) cursor = document.position.end.offset
    parser = null
  }

  /**
   * check if we can reuse nodes from fragments
   * @param {FragmentCursor} fragments
   */
  function couldReuse(fragments) {
    const hash = builder.hash
    // TODO: pass the real lineStart
    if (!fragments.moveTo(cursor, cursor)) return false
    if (!fragments.matches(hash)) return false
    return true
  }

  return {
    get parsedPos() {
      log('parsedPos called', cursor)
      // if return undefined, the call of advance was not as intense
      // console.log('parsedPos called', parser.now)
      return cursor
      // return parser.now
    },
    advance,
    stopAt(pos) {
      log('stopAt called', pos, stoppedAt)
      if (stoppedAt != null && stoppedAt < pos)
        throw new RangeError("Can't move stoppedAt forward")
      stoppedAt = pos
    },
    get stoppedAt() {
      return stoppedAt
    },
  }
}
