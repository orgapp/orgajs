import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useEffect, useRef } from 'react'
import { jsx } from 'react/jsx-runtime'

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
	/** @type {import('react').RefObject<Function|undefined>} */
	const onChangeRef = useRef(onChange)
	/** @type {import('react').RefObject<string>} */
	const initialContent = useRef(content)
	/** @type {import('react').RefObject<import('@codemirror/state').Extension>} */
	const initialExtensions = useRef(extensions)

	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	useEffect(() => {
		if (!container.current || editor.current) return
		const state = EditorState.create({
			doc: initialContent.current,
			extensions: initialExtensions.current
		})
		const ed = new EditorView({
			state,
			parent: container.current,
			dispatch(tr) {
				ed.update([tr])
				if (tr.docChanged) {
					onChangeRef.current?.(ed.state)
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
