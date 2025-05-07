import { Editor } from '@orgajs/react-editor'
import { ReactCodeMirror } from '@orgajs/react-cm'
import { tags as t } from '@lezer/highlight'
import { EditorView } from '@codemirror/view'
import {
	HighlightStyle,
	defaultHighlightStyle,
	syntaxHighlighting,
	foldGutter
} from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'

export function Notice({
	title,
	children
}: {
	title?: string
	children: React.ReactNode
}) {
	return (
		<div role="alert" className="alert">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				className="stroke-info h-6 w-6 shrink-0"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<span>{children}</span>
		</div>
	)
}

const nord0 = '#2E3440',
	nord1 = '#3B4252',
	nord2 = '#434C5E',
	nord3 = '#4C566A',
	nord4 = '#D8DEE9',
	nord5 = '#E5E9F0',
	nord6 = '#ECEFF4',
	nord7 = '#8FBCBB',
	nord8 = '#88C0D0',
	nord9 = '#81A1C1',
	nord10 = '#5E81AC',
	nord11 = '#BF616A',
	nord12 = '#D08770',
	nord13 = '#EBCB8B',
	nord14 = '#A3BE8C',
	nord15 = '#B48EAD'

const nordTheme = EditorView.theme(
	{
		'&': {
			color: nord4,
			backgroundColor: nord0
		},
		'.cm-content': {
			caretColor: nord4
		},
		'.cm-cursor, .cm-dropCursor': { borderLeftColor: nord4 },
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
			{
				backgroundColor: nord2
			},
		'.cm-panels': { backgroundColor: nord1, color: nord5 },
		'.cm-panels.cm-panels-top': { borderBottom: `2px solid ${nord3}` },
		'.cm-panels.cm-panels-bottom': { borderTop: `2px solid ${nord3}` },
		'.cm-searchMatch': {
			backgroundColor: nord13,
			outline: `1px solid ${nord3}`
		},
		'.cm-searchMatch.cm-searchMatch-selected': {
			backgroundColor: nord12
		},
		'.cm-activeLine': { backgroundColor: nord1 },
		'.cm-activeLineGutter': { backgroundColor: nord2 },
		'.cm-selectionMatch': { backgroundColor: nord3 },
		'.cm-matchingBracket, .cm-nonmatchingBracket': {
			backgroundColor: nord8,
			outline: `none`
		},
		'.cm-gutters': {
			backgroundColor: nord0,
			color: nord3,
			border: 'none'
		},
		'.cm-lineNumbers .cm-gutterElement': {
			padding: '0 3px 0 5px'
		},
		'.cm-tooltip': {
			border: `1px solid ${nord3}`,
			backgroundColor: nord2
		},
		'.cm-tooltip-autocomplete': {
			'& > ul > li[aria-selected]': {
				backgroundColor: nord3,
				color: nord6
			}
		}
	},
	{ dark: true }
)

const nordHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: nord9 },
	{
		tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
		color: nord4
	},
	{ tag: [t.function(t.variableName), t.labelName], color: nord8 },
	{ tag: [t.color, t.constant(t.name), t.standard(t.name)], color: nord7 },
	{ tag: [t.definition(t.name), t.separator], color: nord4 },
	{ tag: [t.className], color: nord7 },
	{
		tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
		color: nord15
	},
	{ tag: [t.typeName], color: nord7 },
	{ tag: [t.operator, t.operatorKeyword], color: nord9 },
	{ tag: [t.url, t.escape, t.regexp, t.link], color: nord13 },
	{ tag: [t.meta, t.comment], color: nord3, fontStyle: 'italic' },
	{ tag: [t.strong], fontWeight: 'bold' },
	{ tag: [t.emphasis], fontStyle: 'italic' },
	{ tag: [t.strikethrough], textDecoration: 'line-through' },
	{ tag: [t.string], color: nord14 },
	{ tag: [t.invalid], color: nord11 }
])

const nord = [nordTheme, syntaxHighlighting(nordHighlightStyle)]

export function JSEditor({
	className,
	children
}: {
	className?: string
	children: string
}) {
	return (
		<div className={className}>
			<ReactCodeMirror
				extensions={[
					foldGutter(),
					syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
					javascript(),
					EditorView.editable.of(false),
					nord
				]}
				content={children}
			/>
		</div>
	)
}

export function OrgEditor({ className = '', content, onChange }) {
	return (
		<Editor
			className={className}
			content={content}
			onChange={onChange}
			extensions={[nord]}
		/>
	)
}
