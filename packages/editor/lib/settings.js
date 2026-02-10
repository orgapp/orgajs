/**
 * @typedef {import('@codemirror/state').EditorState} EditorState
 *
 * @typedef {Object} TodoKeywordSet
 * @property {string[]} actionables - The keywords that represent actionable states (e.g. "TODO", "NEXT").
 * @property {string[]} done - The keywords that represent completed states (e.g. "DONE", "CANCELLED").
 *
 * @typedef {Object} Settings
 * @property {string} todo - The set of todo keywords used in the document.
 */

import { syntaxTree } from '@codemirror/language'
import { StateField } from '@codemirror/state'

export const settings = StateField.define({
	create(state) {
		return extractSettings(state)
	},
	update(value, tr) {
		if (tr.docChanged) {
			return extractSettings(tr.state)
		}
		return value
	}
})

/**
 * @param {EditorState} state
 * @return {Settings}
 */
function extractSettings(state) {
	let tree = syntaxTree(state)
	/** @type {Settings} */
	let settings = {
		todo: 'TODO DONE'
	}
	tree.iterate({
		enter(node) {
			if (node.name === 'keyword') {
				const content = state.doc.sliceString(node.from, node.to).trim()
				const m = content.match(/^#\+(\w+):(?:[ \t]+(.*))?$/y)
				if (!m) return true
				const [_, key, value] = m
				if (!key || !value) return true

				if (key.toLowerCase() === 'todo') {
					settings.todo = value.trim()
					return true
				}
			}
			return true
		}
	})
	return settings
}
