import { Range } from 'text-kit'

export interface ParseOptions {
  todos: string[]
  timezone: string
  range?: Partial<Range>
}

export default {
  todos: ['TODO | DONE'],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}
