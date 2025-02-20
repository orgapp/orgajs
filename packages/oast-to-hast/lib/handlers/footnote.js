/**
 * @param {import('../state.js').State} state
 * @param {import('orga').FootnoteReference} node
 * @returns {import('hast').Element}
 */
export function footnoteRef(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'sup',
		properties: { id: `fnref-${node.label}` },
		children: [
			{
				type: 'element',
				tagName: 'a',
				properties: { href: `#fn-${node.label}` },
				children: [{ type: 'text', value: node.label }]
			}
		]
	})
}

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Footnote} node
 * @returns {import('hast').Element}
 */
export function footnote(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'div',
		properties: {
			id: `fn-${node.label}`,
			className: ['footnote'],
			dataLabel: node.label
		},
		children: state.all(node)
	})
}
