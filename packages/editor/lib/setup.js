import { EditorView, highlightActiveLine, lineNumbers } from '@codemirror/view'
import theme from './theme.js'
import { org } from '@orgajs/cm-lang'

/** type {import('@codemirror/state').Extension} */
export const setup = (() => [
  lineNumbers(),
  highlightActiveLine(),
  org(),
  theme,
  EditorView.lineWrapping,
])()
