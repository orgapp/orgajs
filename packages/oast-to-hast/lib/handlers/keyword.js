/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Keyword} node
 * @returns {import('hast').Element|undefined}
 */
export function keyword(state, node) {
	if (node.key.toLowerCase() === 'select_tags') {
		const tags = node.value
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
		state.options.selectTags = tags
	}

	return undefined
}
