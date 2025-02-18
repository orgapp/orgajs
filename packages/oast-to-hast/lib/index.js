/**
 * @typedef {import('hast').Nodes} HastNodes
 * @typedef {import('orga').Nodes} OastNodes
 */

import { createState } from './state.js'

/**
 * @param {OastNodes} tree
 *   oast tree.
 * @param {import('./state.js').Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {HastNodes}
 *   hast tree.
 */
export function toHast(tree, options = {}) {
	const state = createState(tree, options)

	const node = state.one(tree)
	if (Array.isArray(node)) {
		return { type: 'root', children: node }
	}
	// if (tree.type === 'document') {
	// 	return {
	// 		type: 'root',
	// 		data: tree.properties,
	// 		children: node ? [node] : [],
	// 	}
	// }
	return node || { type: 'root', children: [] }
}
