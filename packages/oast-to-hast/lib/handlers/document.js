/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Document} node
 * @returns {import('hast').Root}
 */
export function document(state, node) {
	return {
		type: 'root',
		data: node.properties,
		children: state.all(node),
	}
}
