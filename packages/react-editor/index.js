import { jsx } from 'react/jsx-runtime'
import { ReactCodeMirror } from '@orgajs/react-cm'
import { setup } from '@orgajs/editor'

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
export function Editor({ content = '', className, onChange, extensions = [] }) {
	return jsx(ReactCodeMirror, {
		className,
		content,
		onChange,
		extensions: [setup, extensions]
	})
}
