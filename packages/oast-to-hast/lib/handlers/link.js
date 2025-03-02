/**
 * @import { Element } from 'hast'
 */

import mime from 'mime'

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Link} node
 * @returns {Element}
 */
export function link(state, node) {
	const type = mime.getType(node.path.value)

	if (type && type.startsWith('image')) {
		/** @type {Element} */
		const image = {
			type: 'element',
			tagName: 'img',
			properties: {
				src: node.path.value,
				target: state.options.linkTarget
			},
			children: []
		}
		/** @type {Element|null} */
		let cap = null
		const c = node.attributes['caption']
		if (c) {
			cap = {
				type: 'element',
				tagName: 'figcaption',
				properties: {},
				children: [
					{
						type: 'text',
						value: `${c}`
					}
				]
			}
		} else if (node.children.length > 0) {
			cap = {
				type: 'element',
				tagName: 'figcaption',
				properties: {},
				children: state.all(node)
			}
		}
		if (cap) {
			return state.patch(node, {
				type: 'element',
				tagName: 'figure',
				properties: {},
				children: [image, cap]
			})
		}

		return state.patch(node, image)
	}
	return state.patch(node, {
		type: 'element',
		tagName: 'a',
		properties: {
			href: state.options.linkHref(node),
			target: state.options.linkTarget
		},
		children: state.all(node)
	})
}
