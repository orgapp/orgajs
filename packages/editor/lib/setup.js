import { EditorView, highlightActiveLine } from '@codemirror/view'
import { org } from '@orgajs/cm-lang'
import theme from './theme.js'

/** type {import('@codemirror/state').Extension} */
export const setup = (() => [
  highlightActiveLine(),
  org(),
  theme,
  EditorView.lineWrapping,
])()
