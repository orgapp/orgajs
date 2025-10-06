import { read } from 'text-kit'
import { LexerOptions, defaultLexerOptions } from '../../options'
import { tokenize } from '../index'

export default (text: string, options: Partial<LexerOptions> = {}) => {
	const { substring } = read(text)
	const tokens = tokenize(text, { ...defaultLexerOptions, ...options }).all()
	return tokens.map(({ position, ...token }) => ({
		...token,
		_text: position ? substring(position.start, position.end) : ''
	}))
}
