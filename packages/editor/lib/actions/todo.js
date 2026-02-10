/**
 * @typedef {import('@codemirror/view').EditorView} EditorView
 */

import { syntaxTree } from '@codemirror/language'
import { parseTodoKeywords } from 'orga/todo'
import { getTodo } from './utils'
import { settings } from '../settings'

/**
 * @param {EditorView} view
 */
export function toggleTodo(view) {
	const { state } = view
	const pos = state.selection.main.head
	const tree = syntaxTree(state)

	const _todo = getTodo(tree, pos)
	if (!_todo) return false
	const content = state.sliceDoc(_todo.from, _todo.to)
	const _settings = state.field(settings)
	const t = parseTodoKeywords(_settings.todo)
	const next = t.next(content)
	const change = {
		from: _todo.from,
		to: _todo.to,
		...(next !== undefined && { insert: next })
	}
	view.dispatch({ changes: change })
	console.log({ todo: _todo, content, next })
	return true
}
