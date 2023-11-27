import { foldGutter, toggleFold } from '@codemirror/language'
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view'
import { cleanup } from './extensions/index.js'

const keys = [
  {
    key: 'Tab',
    run: toggleFold,
  },
]

export const battery = (() => [
  highlightActiveLine(),
  foldGutter({
    openText: '▾',
    closedText: '▸',
  }),
  EditorView.lineWrapping,
  cleanup,
  keymap.of(keys),
])()
