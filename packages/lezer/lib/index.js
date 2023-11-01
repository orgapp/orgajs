/**
 * @typedef {import('@lezer/common').PartialParse} PartialParse
 * @typedef {import('@lezer/common').Input} Input
 * @typedef {import('@lezer/common').TreeFragment} TreeFragment
 */

/**
 * @typedef OrgParserConfig
 * @property {import('@lezer/common').NodePropSource[] | undefined | null} props
 */

import { Parser, NodeSet } from '@lezer/common'
import { parseContext } from './context.js'
import { nodeSet } from './nodes.js'
export { tags } from './nodes.js'

export class OrgParser extends Parser {
  /**
   * @param {NodeSet} nodeSet
   * @param {(...data: any[]) => void} [log]
   */
  constructor(nodeSet, log = () => {}) {
    super()
    this.nodeSet = nodeSet
    this.log = log
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

  /**
   * @param {OrgParserConfig} config
   */
  configure(config) {
    let { nodeSet } = this
    let nodeTypes = nodeSet.types.slice()

    nodeSet = new NodeSet(nodeTypes)
    if (config.props && config.props.length > 0) {
      nodeSet = nodeSet.extend(...config.props)
    }
    return new OrgParser(nodeSet, this.log)
  }
}

export const parser = new OrgParser(
  nodeSet
  // console.log.bind(console, 'orga-parser')
)
