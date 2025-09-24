import { bracketMatching, foldGutter, toggleFold } from '@codemirror/language'
import { defaultKeymap } from '@codemirror/commands'
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view'
import { cleanup } from './extensions/cleanup.js'
import { org } from '@orgajs/cm-lang'
import theme from './theme.js'
import { shift } from './actions/shift.js'

const keys = [
	{ key: 'Tab', run: toggleFold },
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
	}
]

export const setup = (() => [
	org(),
	theme,
	keymap.of([...keys, ...defaultKeymap]),
	highlightActiveLine(),
	foldGutter({
		openText: '▾',
		closedText: '▸'
	}),
	EditorView.lineWrapping,
	bracketMatching(),
	cleanup({ hideStars: false })
])()
