/**
 * @import {Document} from 'orga'
 * @import {Root as HastRoot} from 'hast'
 * @import {VFile} from 'vfile'
 *
 * @typedef {import('oast-to-hast').Options} Options
 *
 * @callback TransformMutate
 *  Mutate-mode.
 *
 *  Further transformers run on the hast tree.
 * @param {Document} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {HastRoot}
 *   Tree (hast).
 */

import toHAST from 'oast-to-hast'

/**
 * @param {Partial<Options>} [options]
 * @returns {TransformMutate}
 */
function reorg2rehype(options = {}) {
	return transformer

	/**
	 * @type {TransformMutate}
	 */
	function transformer(tree) {
		return /** @type {HastRoot} */ (toHAST(tree, options))
	}
}

export default reorg2rehype
