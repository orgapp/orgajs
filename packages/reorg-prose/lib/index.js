/**
 * @import {Document as OastRoot} from 'orga'
 * @import {Node as ProseNode} from 'prosemirror-model'
 * @import {Options} from 'oast-to-prose'
 * @import {VFile} from 'vfile'
 */

import { toProse } from 'oast-to-prose'
export { schema } from 'oast-to-prose'

/**
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function reorgProse(options) {
  /**
   * @param {OastRoot} tree
   *   Tree (hast).
   * @param {VFile} file
   *   File.
   * @returns {ProseNode}
   *   Prose Node.
   */
  return function (tree, file) {
    return /** @type {ProseNode} */ (toProse(tree, file, options))
  }
}
