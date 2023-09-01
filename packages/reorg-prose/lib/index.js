/**
 * @typedef {import('orga').Document} Input
 * @typedef {import('prosemirror-model').Node} Output
 * @typedef {import('oast-to-prose').Options} Options
 */

import { toProse } from 'oast-to-prose'
export { schema } from 'oast-to-prose'

/**
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<[Options?], Output>}
 */
export default function reorg2prose(options) {
  Object.assign(this, { Compiler: compiler })

  /**
   * @param {Input} tree
   * @param {import('vfile').VFile} file
   * @returns {Output}
   */
  function compiler(tree, file) {
    return toProse(tree, file, options)
  }
}
