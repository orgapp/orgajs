import { fromHtml } from 'hast-util-from-html'

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').HTML} node
 * @returns {import('hast').Element}
 */
export function html(state, node) {
	return state.patch(node, parseHtml(node.value))
}

/**
 * @param {string} html
 * @returns {import('hast').Element}
 */
export function parseHtml(html) {
	const hast = fromHtml(html, { fragment: true })

	/** @type {import('hast').Element} */
	const result = {
		type: 'element',
		tagName: 'div',
		properties: {},
		children: []
	}

	hast.children.forEach((child) => {
		if (
			child.type === 'element' ||
			child.type === 'text' ||
			child.type === 'comment'
		) {
			result.children.push(child)
		}
	})

	return result
}
