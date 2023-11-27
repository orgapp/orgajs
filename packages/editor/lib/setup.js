import { foldGutter, toggleFold, bracketMatching } from '@codemirror/language'
import { defaultKeymap } from '@codemirror/commands'
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view'
import { cleanup } from './extensions/index.js'
import { org } from '@orgajs/cm-lang'
import theme from './theme.js'

const keys = [
  {
    key: 'Tab',
    run: toggleFold,
  },
]

export const setup = (() => [
  org(),
  theme,
  keymap.of([...defaultKeymap]),
  highlightActiveLine(),
  foldGutter({
    openText: '▾',
    closedText: '▸',
  }),
  EditorView.lineWrapping,
  bracketMatching(),
  cleanup,
  keymap.of([...defaultKeymap, ...keys]),
])()
