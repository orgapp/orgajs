import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@orgajs/cm-lang'

const theme = EditorView.baseTheme({
  '&': {},
  '.hide': { display: 'none' },
  '.cm-link': {
    cursor: 'pointer',
  },
  '.cm-link:hover': {
    backgroundColor: 'yellow',
  },
  '.cm-todo': {
    color: 'red',
  },
  '.cm-done': {
    color: 'green',
  },
  '&light': {
    color: '#383a42',
    backgroundColor: '#fafafa',
  },
  '&dark': {
    color: 'white',
    backgroundColor: 'black',
  },
})

const baseStyle = HighlightStyle.define([
  { tag: t.heading1, fontWeight: 'bold', fontSize: '1.6em' },
  { tag: t.heading2, fontWeight: 'bold', fontSize: '1.4em' },
  { tag: t.heading3, fontWeight: 'bold', fontSize: '1.2em' },
  { tag: t.heading4, fontWeight: 'bold' },
  { tag: t.heading5, fontWeight: 'bold' },
  { tag: t.heading6, fontWeight: 'bold' },
  { tag: t.keyword, fontWeight: 'bold' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  // { tag: t.monospace, color: 'blue' }, // TODO: change font?
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.underline, textDecoration: 'underline' },
])

const lightColors = HighlightStyle.define(
  [
    { tag: t.keyword, color: '#e45649' },
    { tag: t.comment, color: '#9ca0a4' },
    { tag: t.monospace, color: 'blue' },
    { tag: t.link, color: 'blue' },
    { tag: t.processingInstruction, color: '#9ca0a4' },
    { tag: t.attributeName, color: '#9ca0a4' },
  ],
  { themeType: 'light' }
)

const darkColors = HighlightStyle.define(
  [
    { tag: t.keyword, color: 'green' },
    { tag: t.comment, color: 'red' },
    { tag: t.monospace, backgroundColor: 'blue' },
    { tag: t.link, color: '#5cc9f5' },
    { tag: t.processingInstruction, color: 'gray' },
    { tag: t.attributeName, color: 'gray' },
  ],
  { themeType: 'dark' }
)

export default [
  theme,
  syntaxHighlighting(lightColors),
  syntaxHighlighting(darkColors),
  syntaxHighlighting(baseStyle),
]
