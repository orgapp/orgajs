import { foldGutter, toggleFold } from '@codemirror/language'
import {
  EditorView,
  highlightActiveLine,
  keymap,
  showPanel,
} from '@codemirror/view'
import { org } from '@orgajs/cm-lang'
import { cleanupPlugin } from './plugins/cleanup.js'
import theme from './theme.js'

/**
 * @returns {import('@codemirror/view').Panel}
 */
function footer() {
  const dom = document.createElement('div')
  dom.textContent = `footer`
  return {
    dom,
    update(update) {
      dom.textContent = `c:${update.state.selection.ranges[0].from}`
    },
  }
}

const keys = [
  {
    key: 'Tab',
    run: toggleFold,
  },
]

export const setup = (() => [
  highlightActiveLine(),
  foldGutter(),
  org(),
  theme,
  EditorView.lineWrapping,
  cleanupPlugin,
  showPanel.of(footer),
  keymap.of(keys),
])()
