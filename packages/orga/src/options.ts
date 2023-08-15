import { Range } from 'text-kit'

export interface LexerOptions {
  todos: string[]
  timezone: string
  range?: Partial<Range>
}

export interface ParserOptions {
  flat: boolean
  range?: Partial<Range>
}

export interface Options extends LexerOptions, ParserOptions {}

export function withDefault(options: Partial<Options>): Options {
  return {
    ...defaultOptions,
    ...options,
  }
}

const defaultOptions: Options = {
  todos: ['TODO | DONE'],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  flat: false,
}
