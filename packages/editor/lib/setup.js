import { foldGutter, toggleFold } from '@codemirror/language'
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view'
import { org } from '@orgajs/cm-lang'
import { cleanupPlugin } from './plugins/cleanup.js'
import theme from './theme.js'

const keys = [
  {
    key: 'Tab',
    run: toggleFold,
  },
]

export const setup = (() => [
  highlightActiveLine(),
  foldGutter({
    openText: '▾',
    closedText: '▸',
  }),
  org(),
  theme,
  EditorView.lineWrapping,
  cleanupPlugin,
  keymap.of(keys),
])()
