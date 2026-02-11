import { Range } from 'text-kit'
import { Settings } from './types'
import { defaultTodoManager, TodoManager } from './todo.js'

export interface LexerOptions {
	timezone: string
	range?: Partial<Range>
	todo: TodoManager
}

export interface ParserOptions {
	flat: boolean
	range?: Partial<Range>
	settings?: Settings
}

export interface Options {
	timezone: string
	range?: Partial<Range>
	settings?: Settings
	flat: boolean
}

export const defaultParserOptions: ParserOptions = {
	flat: false
}

export const defaultLexerOptions: LexerOptions = {
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	todo: defaultTodoManager
}

export const defaultOptions: Options = {
	timezone: defaultLexerOptions.timezone,
	flat: defaultParserOptions.flat
}
