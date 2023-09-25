import { EditorView, highlightActiveLine, showPanel } from '@codemirror/view'
import { org } from '@orgajs/cm-lang'
import theme from './theme.js'
import { cleanupPlugin } from './plugins/cleanup.js'

/**
 * @returns {import('@codemirror/view').Panel')}
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

export const setup = (() => [
  highlightActiveLine(),
  org(),
  theme,
  EditorView.lineWrapping,
  cleanupPlugin,
  showPanel.of(footer),
])()
