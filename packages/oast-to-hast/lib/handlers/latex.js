/**
 * @param {import('../state.js').State} _
 * @param {import('orga').Latex} node
 * @returns {import('hast').Element}
 */
export function latex(_, node) {
	return {
		type: 'element',
		tagName: 'div',
		properties: { className: ['math-display'] },
		children: [
			{
				type: 'text',
				value: node.value,
			},
		],
	}
}
