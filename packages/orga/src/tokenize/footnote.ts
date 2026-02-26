import type { Reader } from 'text-kit'
import type { Token } from '../types.js'
import { tokenize as tokenizeInline } from './inline/index.js'

export default (reader: Reader): Token[] | undefined => {
	const { isStartOfLine, match, jump, eat } = reader
	if (!isStartOfLine()) return
	let tokens: Token[] = []
	const m = match(/^\[fn:([^\]]+)\](?=\s)/y)
	if (!m) return []
	tokens.push({
		type: 'footnote.label',
		label: m.result[1],
		position: m.position
	})
	jump(m.position.end)
	eat('whitespaces')

	tokens = tokens.concat(tokenizeInline(reader))

	return tokens
}
