export interface ParseOptions {
  todos: string[]
  timezone: string
}

export default {
  todos: ['TODO | DONE'],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}
