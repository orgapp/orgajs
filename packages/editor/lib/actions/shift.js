/**
 * @file Actions to shift sections.
 *
 * @typedef {import('@codemirror/view').EditorView} EditorView
 * @typedef {import('@lezer/common').Tree} Tree
 * @typedef {import('@lezer/common').SyntaxNode} Node
 * @typedef {import('@codemirror/state').ChangeSpec} ChangeSpec
 */

import { syntaxTree } from '@codemirror/language'

/**
 * Shift the headline.
 * @param {number} delta - The number of spaces to shift. Positive values shift right, negative values shift left.
 * @param {boolean} [recursive=false] - Whether to shift subsections recursively.
 */
export function shift(delta, recursive = false) {
	/**
	 * @param {EditorView} view
	 */
	return function (view) {
		const { state } = view
		const tree = syntaxTree(state)
		const pos = state.selection.main.head
		// the selection must be in a headline
		const headline = getHeadline(tree, pos)
		if (!headline) return false
		/** @type {ChangeSpec[]} */
		const changes = []
		let cancelled = false
		if (recursive === false) {
			const stars = headline.getChild('stars')
			if (!stars || stars.to - stars.from + delta < 1) {
				return true
			}
			const change = _shift(stars, delta)
			if (change) {
				changes.push(change)
			}
		} else {
			let cursor = headline.cursor()
			const change = _shift(headline, delta)
			if (change) {
				changes.push(change)
			} else {
				return true
			}
			while (cursor.nextSibling()) {
				if (cursor.type.name === 'headline') {
					const change = _shift(cursor.node, delta)
					if (change) {
						changes.push(change)
					} else {
						cancelled = true
						break
					}
				}
			}
		}

		if (!cancelled && changes.length > 0) {
			view.dispatch({ changes })
		}
		return true
	}
}

/**
 * shift the stars
 * @param {Node|null|undefined} node
 * @param {number} delta
 * @returns {ChangeSpec | undefined}
 */
function _shift(node, delta) {
	if (!node) return undefined
	if (node.type.name === 'headline')
		return _shift(node.getChild('stars'), delta)
	if (node.type.name !== 'stars') return

	if (delta > 0) {
		return {
			from: node.from,
			insert: '*'.repeat(delta)
		}
	}
	if (delta < 0 && node.to - node.from + delta >= 1) {
		return {
			from: node.from,
			to: node.from - delta,
			insert: ''
		}
	}
}

/**
 * @param {Tree} tree
 * @param {number} pos
 */
function getHeadline(tree, pos) {
	/** @type {import('@lezer/common').NodeIterator | null} */
	let iter = tree.resolveStack(pos)
	while (iter) {
		const name = iter.node.type.name
		if (name.startsWith('headline')) return iter.node
		iter = iter.next
	}
	return null
}
