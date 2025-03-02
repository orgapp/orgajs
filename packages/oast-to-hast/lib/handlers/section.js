/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Section} node
 * @returns {import('hast').Element|undefined}
 */
export function section(state, node) {
	const headline = node.children.find((n) => n.type === 'headline')

	if (headline) {
		if (shouldSkip(state.options, headline.tags || [])) {
			return undefined
		}
	}

	let className = 'section'
	const drawer = node.children.find((n) => n.type === 'drawer')
	if (drawer && drawer.name === 'PROPERTIES') {
		const lines = drawer.value.split('\n')
		lines.forEach((line) => {
			const m = line.match(/:(\w+):(.*)$/)
			if (m && m[1].toUpperCase() === 'HTML_CONTAINER_CLASS') {
				className = `${className} ${m[2].trim()}`
			}
		})
	}

	return state.patch(node, {
		type: 'element',
		tagName: 'div',
		properties: { className },
		children: state.all(node)
	})
}

/**
 * @param {import('../state.js').Config} config
 * @param {string[]} tags
 * @returns {boolean}
 */
function shouldSkip({ selectTags = [], excludeTags = [] }, tags) {
	if (selectTags.length > 0) {
		return !tags.some((tag) => selectTags.includes(tag))
	}

	if (excludeTags.length > 0) {
		return tags.some((tag) => excludeTags.includes(tag))
	}

	return false
}
