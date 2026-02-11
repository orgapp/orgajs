import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@orgajs/cm-lang'

const theme = EditorView.baseTheme({
	'&': {
		height: '100%'
	},
	'.cm-link': {
		cursor: 'pointer'
	},
	'.cm-org-todo': {
		color: 'white',
		backgroundColor: 'green',
		padding: '0 2px',
		borderRadius: '2px',
		cursor: 'pointer'
	},
	'.cm-org-todo[data-actionable="true"]': {
		backgroundColor: 'red'
	}
})

const baseStyle = HighlightStyle.define([
	{
		tag: [t.heading],
		fontWeight: 'bold',
		textDecoration: 'underline'
	},
	{ tag: [t.keyword, t.strong], fontWeight: 'bold' },
	{ tag: t.emphasis, fontStyle: 'italic' },
	{
		tag: t.monospace,
		borderRadius: '4px',
		padding: '1px 4px',
		fontFamily: "'JetBrains Mono', monospace"
	},
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.underline, textDecoration: 'underline' }
])

const lightColors = HighlightStyle.define(
	[
		{ tag: t.keyword, color: '#e45649' },
		{ tag: t.comment, color: '#9ca0a4' },
		{ tag: t.processingInstruction, color: '#9ca0a4' },
		{ tag: t.attributeName, color: '#9ca0a4' }
	],
	{ themeType: 'light' }
)

const darkColors = HighlightStyle.define(
	[
		{ tag: t.keyword, color: 'green' },
		{ tag: t.comment, color: 'red' },
		{ tag: t.processingInstruction, color: 'gray' },
		{ tag: t.attributeName, color: 'gray' }
	],
	{ themeType: 'dark' }
)

export default [
	theme,
	syntaxHighlighting(lightColors),
	syntaxHighlighting(darkColors),
	syntaxHighlighting(baseStyle)
]
