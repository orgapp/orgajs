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
  const log = config.log
  let cursor = ranges[0].from
  let end = ranges[ranges.length - 1].to
  let rangeI = 0
  /** @type {number | null} */
  let stoppedAt = null
  const full = input.read(0, input.length)
  /** @type {import('orga').Parser | null} */
  let parser = null

  // const parser = makeParser(full, { range: { start, end } })
  const builder = treeBuilder(nodes.document, 0, cursor, 0, 0)

  const fragments = _fragments.length
    ? fragmentCursor(_fragments, input, log)
    : null

  /**
   * check if we reached the end of the input (ranges)
   * finish the block in parser if exist
   * check if we can reuse a fragment
   * @returns {import('@lezer/common').Tree | null}
   */
  function advance() {
    log('advance called', cursor, end)
    if (stoppedAt != null && cursor > stoppedAt) return builder.build()

    if (cursor >= end) {
      return builder.build()
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
      parser = makeParser(full, { range: { start: cursor, end }, flat: true })
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
      `wrap up parser: ${document.children.length}, ${document.position?.start.offset}, ${document.position?.end.offset}`
    )
    const tree = toLezer(document)
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
