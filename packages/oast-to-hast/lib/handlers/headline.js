/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Headline} node
 * @returns {import('hast').Element}
 */
export function headline(state, node) {
	return {
		type: 'element',
		tagName: `h${node.level}`,
		properties: {},
		children: state.all(node),
	}
}
