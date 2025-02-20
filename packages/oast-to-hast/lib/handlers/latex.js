/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Latex} node
 * @returns {import('hast').Element}
 */
export function latex(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'div',
		properties: { className: ['math-display'] },
		children: [
			{
				type: 'text',
				value: node.value
			}
		]
	})
}
