import { EditorView, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { org } from '@orgajs/cm-lang'
import theme from './theme.js'

/**
 * @param {HTMLElement} target
 * @param {string} content
 */
export function makeEditor(target, content) {
  let editor = new EditorView({
    doc: content,
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      org(),
      ...theme,
      EditorView.lineWrapping,
    ],
    parent: target,
  })
  return editor
}
