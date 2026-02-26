import type { Reader } from 'text-kit'
import type { Token } from '../types.js'

export default (reader: Reader): Token[] | undefined => {
	const { match, eat, endOfLine } = reader

	const b = match(/\\begin\{([a-zA-Z0-9*]+)\}\s*$/imy, { end: endOfLine() })
	if (b) {
		eat('line')
		return [
			{
				type: 'latex.begin',
				name: b.result[1],
				position: { ...b.position }
			}
		]
	}

	const e = match(/\\end\{([a-zA-Z0-9*]+)\}\s*$/imy, { end: endOfLine() })
	if (e) {
		reader.eat('line')
		return [
			{
				type: 'latex.end',
				name: e.result[1],
				position: { ...e.position }
			}
		]
	}
}
