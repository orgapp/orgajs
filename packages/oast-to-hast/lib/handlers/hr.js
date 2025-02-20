/**
 * @param {import('../state.js').State} state
 * @param {import('orga').HorizontalRule} node
 * @returns {import('hast').Element}
 */
export function hr(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'hr',
		properties: {},
		children: []
	})
}
