/**
 * @param {import('../state.js').State} state
 * @param {import('orga').List} node
 * @returns {import('hast').Element}
 */
export function list(state, node) {
	let tagName = node.ordered ? 'ol' : 'ul'
	if (node.children.every((i) => i.type === 'list.item' && i.tag)) {
		tagName = 'dl'
	}

	const properties = state.getAttrHtml(node)

	return state.patch(node, {
		type: 'element',
		tagName: tagName,
		properties: properties ?? {},
		children: state.all(node)
	})
}

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').ListItem} node
 * @returns {import('hast').Element}
 */
export function item(state, node) {
	if (node.tag) {
		return state.patch(node, {
			type: 'element',
			tagName: 'div',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'dt',
					properties: {},
					children: [
						{
							type: 'text',
							value: node.tag
						}
					]
				},
				{
					type: 'element',
					tagName: 'dd',
					properties: {},
					children: state.all(node)
				}
			]
		})
	}
	return state.patch(node, {
		type: 'element',
		tagName: 'li',
		properties: {},
		children: state.all(node)
	})
}

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').ListItemCheckbox} node
 * @returns {import('hast').Element}
 */
export function checkbox(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'input',
		properties: {
			type: 'checkbox',
			checked: node.checked,
			disabled: true
		},
		children: []
	})
}
