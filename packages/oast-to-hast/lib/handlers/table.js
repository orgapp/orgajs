/**
 * @import {Element} from 'hast'
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
	const firstRow = rows.shift()
	/** @type {Element[]} */
	const tableContent = []
	if (firstRow) {
		/** @type {Element} */
		const head = {
			type: 'element',
			tagName: 'thead',
			properties: {},
			children: [firstRow],
		}

		tableContent.push(head)
	}

	if (rows.length > 0) {
		/** @type {Element} */
		const body = {
			type: 'element',
			tagName: 'tbody',
			properties: {},
			children: rows,
		}

		tableContent.push(body)
	}

	const caption = `${node.attributes.caption}`
	tableContent.push({
		type: 'element',
		tagName: 'caption',
		properties: {},
		children: [{ type: 'text', value: caption }],
	})

	return {
		type: 'element',
		tagName: 'table',
		properties: {},
		children: tableContent,
	}
}

/**
 * @param {State} state
 * @param {TableRow} node
 * @returns {Element}
 */
export function tableRow(state, node) {
	return {
		type: 'element',
		tagName: 'tr',
		properties: {},
		children: state.all(node),
	}
}

/**
 * @param {State} state
 * @param {TableCell} node
 * @returns {Element}
 */
export function tableCell(state, node) {
	return {
		type: 'element',
		tagName: 'td',
		properties: {},
		children: state.all(node),
	}
}
