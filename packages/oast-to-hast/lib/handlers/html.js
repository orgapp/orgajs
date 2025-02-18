import { fromHtml } from 'hast-util-from-html'

/**
 * @param {import('../state.js').State} _
 * @param {import('orga').HTML} node
 * @returns {import('hast').Element}
 */
export function html(_, node) {
	return parseHtml(node.value)
}

/**
 * @param {string} html
 * @returns {import('hast').Element}
 */
export function parseHtml(html) {
	const hast = fromHtml(html, { fragment: true })
	console.log({ html })
	console.log(hast)

	/** @type {import('hast').Element} */
	const result = {
		type: 'element',
		tagName: 'div',
		properties: {},
		children: [],
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

	console.log(result)

	return result
}
