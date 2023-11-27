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
import { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { org } from '@orgajs/cm-lang'
import theme from './theme.js'

/**
 * @param {Config} config
 */
export function makeEditor(config) {
  const themeConfig = new Compartment()
  const {
    target,
    content = '',
    extensions = [],
    dark = false,
    onChange,
  } = config
  const state = EditorState.create({
    doc: content,
    extensions: [
      org(),
      themeConfig.of(EditorView.theme({}, { dark })),
      theme,
      extensions,
    ],
  })
  const editor = new EditorView({
    state,
    parent: target,
    dispatch: (tr) => {
      editor.update([tr])
      tr.docChanged && onChange && onChange(editor.state)
    },
  })

  /** @param {boolean} dark */
  function setDarkMode(dark) {
    editor.dispatch({
      effects: themeConfig.reconfigure(EditorView.theme({}, { dark })),
    })
  }
  return { editor, setTheme: setDarkMode }
}
