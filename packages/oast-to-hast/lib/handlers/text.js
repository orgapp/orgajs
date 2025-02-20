/**
 * @import {Element,Text} from 'hast'
 *
 */

const wrapper = {
	bold: 'strong',
	italic: 'i',
	code: 'code',
	verbatim: 'code',
	underline: 'u',
	strikeThrough: 'del',
	math: 'span'
}

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Text} node
 * @returns {Element|Text}
 */
export function text(state, node) {
	/** @type {Element|Text} */
	let e = {
		type: 'text',
		value: node.value
	}
	if (node.style) {
		e = {
			type: 'element',
			tagName: wrapper[node.style],
			properties: {},
			children: [e]
		}
		if (node.style === 'math') {
			e.properties.className = ['math-inline']
		}
	}
	return state.patch(node, e)
}
