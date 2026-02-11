/**
 * @file Actions to shift sections.
 *
 * @typedef {import('@codemirror/view').EditorView} EditorView
 * @typedef {import('@lezer/common').Tree} Tree
 * @typedef {import('@lezer/common').SyntaxNode} Node
 * @typedef {import('@codemirror/state').ChangeSpec} ChangeSpec
 */
import { foldAll, foldState, unfoldAll, unfoldCode } from '@codemirror/language'
import { toggleFold as _toggleFold, foldCode } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { selectedLines } from './utils'

/**
 * @param {EditorView} view
 */
export function toggleFold(view) {
	const { state } = view

	const lines = selectedLines(view)
	for (let line of lines) {
		let folded = findFold(state, line.from, line.to)
		if (folded) {
			unfoldCode(view)
		} else {
			foldCode(view)
		}
	}
	return true
}

/**
 * @param {EditorState} state
 * @param {number} from
 * @param {number} to
 */
function findFold(state, from, to) {
	/** @type {{from:number, to:number} | null} */ let found = null
	state.field(foldState, false)?.between(from, to, (from, to) => {
		if (!found || found.from > from) found = { from, to }
	})
	return found
}

/**
 * @param {EditorView} view
 */
export function toggleFoldAll(view) {
	const state = view.state
	const folds = state.field(foldState, false)
	if (folds && folds.size) {
		unfoldAll(view)
	} else {
		foldAll(view)
	}
	return true
}
