/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Headline} node
 * @returns {import('hast').Element}
 */
export function headline(state, node) {
	const id = state.ids.byNode.get(node)
	return state.patch(node, {
		type: 'element',
		tagName: `h${node.level}`,
		properties: id ? { id } : {},
		children: state.all(node)
	})
}
