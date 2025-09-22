/**
 * @callback OnChange
 * @param {EditorState} state
 */

/**
 * @typedef Config
 * @property {Element} target
 * @property {string} [content='']
 * @property {import('@codemirror/state').Extension} [extensions=[]]
 * @property {boolean} [dark=false]
 * @property {OnChange} [onChange=() => {}]
 */
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { setup } from './setup.js'

/**
 * @param {Config} config
 */
export function makeEditor(config) {
	const { target, content = '', extensions = [], onChange } = config
	const state = EditorState.create({
		doc: content,
		extensions: [setup, extensions]
	})
	const editor = new EditorView({
		state,
		parent: target,
		dispatch: (tr) => {
			editor.update([tr])
			tr.docChanged && onChange && onChange(editor.state)
		}
	})

	return { editor }
}
