import type { Reader } from 'text-kit'
import type { Token } from '../../types.js'
import uri from '../../uri.js'
import type { Tokenizer } from '../index.js'
import { tokenize } from './index.js'
import tokenizeText from './text.js'

const tokenizeLink: Tokenizer = (reader: Reader) => {
	const tokens: Token[] = []
	const { eat, findClosing, jump, getChar, now } = reader
	if (getChar() !== '[') {
		return
	}
	const linkOpening = eat('char')
	// if (!linkOpening) return

	tokens.push({
		type: 'opening',
		element: 'link',
		position: linkOpening.position
	})

	const linkClosing = findClosing(linkOpening.position.start)
	if (!linkClosing) return

	if (getChar() !== '[') {
		return
	}
	const pathOpening = eat('char')
	const pathClosing = findClosing(pathOpening.position.start)
	if (!pathClosing) return

	const linkInfo = uri(reader.substring(pathOpening.position.end, pathClosing))
	if (!linkInfo) return

	jump(pathClosing)
	eat('char') // eat the ]

	tokens.push({
		type: 'link.path',
		...linkInfo,
		position: {
			start: pathOpening.position.start,
			end: now()
		}
	})
	if (getChar() === '[') {
		const descClosing = findClosing()
		if (!descClosing) {
			return
		}
		eat() // descOpening
		const desc = tokenize(reader.read({ end: descClosing }), [
			tokenizeText(now())
		])
		tokens.push(...desc)
	}

	jump(linkClosing)
	tokens.push({
		type: 'closing',
		element: 'link',
		position: eat().position
	})

	return tokens
}

export default tokenizeLink
