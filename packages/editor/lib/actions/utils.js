/**
 * @typedef {import('@codemirror/view').EditorView} EditorView
 * @typedef {import('@lezer/common').Tree} Tree
 */

/**
 * @param {EditorView} view
 */
export function selectedLines(view) {
	/** @type {Array<import('@codemirror/view').BlockInfo>} */
	let lines = []
	for (let { head } of view.state.selection.ranges) {
		if (lines.some((l) => l.from <= head && l.to >= head)) continue
		lines.push(view.lineBlockAt(head))
	}
	return lines
}

/**
 * @param {Tree} tree
 * @param {number} pos
 */
export function getTodo(tree, pos) {
	const headline = getNode(tree, pos, 'headline')
	return headline?.getChild('todo')
}

/**
 * @param {Tree} tree
 * @param {number} pos
 * @param {string} type
 */
export function getNode(tree, pos, type) {
	/** @type {import('@lezer/common').NodeIterator | null} */
	let iter = tree.resolveStack(pos)
	while (iter) {
		const name = iter.node.type.name
		if (name === type) return iter.node
		iter = iter.next
	}
	return null
}
