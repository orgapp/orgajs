/**
 * @import {Document as OastRoot} from 'orga'
 * @import {Node as ProseNode} from 'prosemirror-model'
 * @import {Options} from 'oast-to-prose'
 * @import {Processor} from 'unified'
 * @import {VFile} from 'vfile'
 */

/**
 * @callback TransformBridge
 *   Bridge-mode.
 *
 *   Runs the destination with the new hast tree.
 *   Discards result.
 * @param {OastRoot} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {Promise<undefined>}
 *   Nothing.
 *
 * @callback TransformMutate
 *  Mutate-mode.
 *
 *  Further transformers run on the hast tree.
 * @param {OastRoot} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {ProseNode}
 *   Tree (prose node).
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
    // Cast because root in -> root out.
    // To do: in the future, disallow ` || options` fallback.
    // With `unified-engine`, `destination` can be `undefined` but
    // `options` will be the file set.
    // We should not pass that as `options`.
    return /** @type {ProseNode} */ (toProse(tree, file, options))

    // this.compiler = compiler

    // /**
    //  * @param {Input} tree
    //  * @param {import('vfile').VFile} file
    //  * @returns {Output}
    //  */
    // function compiler(tree, file) {
    //   return toProse(tree, file, options)
    // }
  }
}
