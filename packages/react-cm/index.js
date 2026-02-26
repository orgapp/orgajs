import { jsx } from 'react/jsx-runtime'
import { useRef, useEffect } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

/**
 * A React component that renders an Orga editor.
 *
 * @param {Object} props - The component props
 * @param {string} [props.content=''] - The initial content for the editor
 * @param {string} [props.className] - CSS class name to apply to the editor container
 * @param {Function} [props.onChange] - Callback function that receives the updated content when changes occur
 * @param {import('@codemirror/state').Extension} [props.extensions] - Array of CodeMirror extensions to customize the editor
 * @returns {import('react').ReactElement} A div element containing the editor
 */
export function ReactCodeMirror({
	className = '',
	content = '',
	extensions = [],
	onChange
}) {
	/** @type {import('react').RefObject<HTMLElement|undefined>} */
	const container = useRef(undefined)
	/** @type {import('react').RefObject<import('@codemirror/view').EditorView|undefined>} */
	const editor = useRef(undefined)

	useEffect(() => {
		if (!container.current || editor.current) return
		const state = EditorState.create({
			doc: content,
			extensions
		})
		const ed = new EditorView({
			state,
			parent: container.current,
			dispatch(tr) {
				ed.update([tr])
				if (tr.docChanged) {
					onChange?.(ed.state)
				}
			}
		})
		editor.current = ed
		return () => {
			ed.destroy()
			editor.current = undefined
		}
	}, [])

	useEffect(() => {
		if (!editor.current) return
		if (editor.current.state.doc.toString() === content) return
		editor.current.dispatch({
			changes: {
				from: 0,
				to: editor.current.state.doc.length,
				insert: content
			}
		})
	}, [content])

	return jsx('div', { ref: container, className })
}
