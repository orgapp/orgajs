import { bracketMatching, foldGutter } from '@codemirror/language'
import { defaultKeymap } from '@codemirror/commands'
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view'
import { org } from '@orgajs/cm-lang'
import { cleanup } from './extensions/cleanup.js'
import theme from './theme.js'
import { shift } from './actions/shift.js'
import { toggleFold, toggleFoldAll } from './actions/fold.js'
import { settings } from './settings'
import { toggleTodo } from './actions/todo'

const keys = [
	{ key: 'Tab', run: toggleFold, shift: toggleFoldAll },
	{
		key: 'Cmd-ArrowLeft',
		run: shift(-1),
		shift: shift(-1, true),
		preventDefault: true
	},
	{
		key: 'Cmd-ArrowRight',
		run: shift(1),
		shift: shift(1, true),
		preventDefault: true
	},
	{
		key: 'Cmd-x',
		run: toggleTodo,
		preventDefault: true
	}
]

export const setup = (() => [
	org(),
	settings,
	theme,
	keymap.of([...keys, ...defaultKeymap]),
	highlightActiveLine(),
	foldGutter({
		openText: '▾',
		closedText: '▸'
	}),
	EditorView.lineWrapping,
	bracketMatching(),
	cleanup({ hideStars: false, hideLinks: true })
])()
