import { EditorView } from '@codemirror/view'
import { setup } from './setup.js'
import { Compartment, EditorState } from '@codemirror/state'

/**
 * @typedef Config
 * @property {Element} target
 * @property {string} [content='']
 * @property {import('@codemirror/state').Extension} [extensions=[]]
 * @property {boolean} [dark=false]
 */

/**
 * @param {Config} config
 */
export function makeEditor(config) {
  const themeConfig = new Compartment()
  const { target, content = '', extensions = [], dark = false } = config
  const state = EditorState.create({
    doc: content,
    extensions: [
      themeConfig.of(EditorView.theme({}, { dark })),
      extensions,
      setup,
    ],
  })
  const editor = new EditorView({
    state,
    parent: target,
  })

  /** @param {boolean} dark */
  function setDarkMode(dark) {
    editor.dispatch({
      effects: themeConfig.reconfigure(EditorView.theme({}, { dark })),
    })
  }
  return { editor, setTheme: setDarkMode }
}
