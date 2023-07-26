import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const theme = EditorView.theme(
  {
    '&': {
      color: '#383a42',
      backgroundColor: '#fafafa',
    },
  },
  { dark: false }
)

const hlStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#e45649', fontWeight: 'bold' },
  { tag: t.comment, color: '#9ca0a4' },
  { tag: t.strong, fontWeight: 'bold' },
])

const hl = syntaxHighlighting(hlStyle)

export default [theme, hl]
