import type { FootnoteLabel } from '../types.js'
import type { Action } from './index.js'

const Footnote: Action = (token: FootnoteLabel, { enter, exitTo, consume }) => {
	exitTo('document')
	enter({
		type: 'footnote',
		label: token.label,
		children: []
	})
	consume()
}

export default Footnote
