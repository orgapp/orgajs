/**
 * @import {Element,ElementContent} from 'hast'
 * @import {Table,TableCell,TableRow} from 'orga'
 * @import {State} from '../state.js'
 */

/**
 * @param {State} state
 * @param {Table} node
 * @returns {Element}
 */
export function table(state, node) {
	const rows = state.all(node)
	const hrIndex = rows.findIndex(
		(row) => row.type === 'element' && row.tagName === 'hr'
	)

	/** @type {ElementContent[]} */
	let headRows = []
	/** @type {ElementContent[]} */
	const bodyRows = []
	rows.forEach((row, i) => {
		if (i < hrIndex) {
			headRows.push(row)
		} else if (i > hrIndex) {
			bodyRows.push(row)
		}
	})

	/** @type {ElementContent[]} */
	const tableContent = []

	if (headRows.length > 0) {
		tableContent.push({
			type: 'element',
			tagName: 'thead',
			properties: {},
			children: headRows
		})
	}

	if (bodyRows.length > 0) {
		tableContent.push({
			type: 'element',
			tagName: 'tbody',
			properties: {},
			children: bodyRows
		})
	}

	const caption = node.attributes.caption
	if (caption) {
		tableContent.push({
			type: 'element',
			tagName: 'caption',
			properties: {},
			children: [{ type: 'text', value: `${caption}` }]
		})
	}

	return state.patch(node, {
		type: 'element',
		tagName: 'table',
		properties: {},
		children: tableContent
	})
}

/**
 * @param {State} state
 * @param {TableRow} node
 * @returns {Element}
 */
export function row(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'tr',
		properties: {},
		children: state.all(node)
	})
}

/**
 * @param {State} state
 * @param {TableCell} node
 * @returns {Element}
 */
export function cell(state, node) {
	return state.patch(node, {
		type: 'element',
		tagName: 'td',
		properties: {},
		children: state.all(node)
	})
}

/**
 * @returns {Element}
 */
export function hr() {
	return {
		type: 'element',
		tagName: 'hr',
		properties: {},
		children: []
	}
}
