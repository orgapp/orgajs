import { jsx } from 'react/jsx-runtime'
import { useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useEffect } from 'react'

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
	const state = EditorState.create({
		doc: content,
		extensions
	})

	/** @type {import('react').RefObject<HTMLElement|undefined>} */
	const container = useRef(undefined)

	useEffect(() => {
		if (!container.current) return
		const editor = new EditorView({
			state,
			parent: container.current,
			dispatch: (tr) => {
				editor.update([tr])
				tr.docChanged && onChange && onChange(editor.state)
			}
		})
	}, [container.current])

	return jsx('div', { ref: container, className })
}
