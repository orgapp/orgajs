import {
	type LexerOptions,
	type Options,
	defaultLexerOptions,
	defaultParserOptions
} from './options.js'
import { parser as _parser, type Parser } from './parse/index.js'
import { parse as parseTimestamp } from './timestamp.js'
import { todoManager } from './todo'
import { Lexer, tokenize as _tokenize } from './tokenize/index.js'
import type { Document, Settings } from './types.js'

export * from './types.js'
export { parseTimestamp, Options as ParseOptions, Parser }

export const tokenize = (
	text: string,
	options: Partial<LexerOptions> = {}
): Lexer => {
	return _tokenize(text, { ...defaultLexerOptions, ...options })
}

export const parse = (
	text: string,
	options: Partial<Options> = {}
): Document => {
	const parser = makeParser(text, options)
	return parser.parse()
}

export function makeParser(text: string, options: Partial<Options> = {}) {
	const { range, ..._options } = { ...defaultParserOptions, ...options }
	const todo = todoManager(...getTodo(options.settings))
	const start = range?.start
	const lexer = tokenize(text, {
		..._options,
		todo,
		range: start ? { start, end: Infinity } : undefined
	})
	return _parser(lexer, { ..._options, range })
}

function getTodo(settings: Settings) {
	const todo = settings?.todo
	if (Array.isArray(todo)) return todo
	if (typeof todo === 'string') return [todo]
	return ['TODO DONE']
}
