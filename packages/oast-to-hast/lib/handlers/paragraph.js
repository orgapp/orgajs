/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Paragraph} node
 * @returns {import('hast').Element}
 */
export function paragraph(state, node) {
	const properties = state.getAttrHtml(node)

	return state.patch(node, {
		type: 'element',
		tagName: 'p',
		properties: properties ?? {},
		children: state.all(node)
	})
}
