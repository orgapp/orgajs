import type { EditorView } from '@codemirror/view'

type WithEditorCallback = (editor: EditorView) => void
const callbacks: WithEditorCallback[] = []
let editor: EditorView | null = null

export function setEditor(_editor: EditorView) {
  editor = _editor
  for (const callback of callbacks) {
    callback(editor)
  }
}

export function withEditor(callback: WithEditorCallback) {
  callbacks.push(callback)
  if (editor) {
    callback(editor)
  }
}
