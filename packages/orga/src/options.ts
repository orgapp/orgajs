import type { Range } from 'text-kit'
import { defaultTodoManager, type TodoManager } from './todo.js'
import type { Settings } from './types.js'

export interface LexerOptions {
	range?: Partial<Range>
	todo: TodoManager
}

export interface ParserOptions {
	flat: boolean
	range?: Partial<Range>
	settings?: Settings
}

export interface Options {
	range?: Partial<Range>
	settings?: Settings
	flat: boolean
}

export const defaultParserOptions: ParserOptions = {
	flat: false
}

export const defaultLexerOptions: LexerOptions = {
	todo: defaultTodoManager
}

export const defaultOptions: Options = {
	flat: defaultParserOptions.flat
}
