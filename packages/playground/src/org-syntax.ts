export const tokenizer = {
  root: [
    [/^(\*+)\s+(.*)$/, 'keyword'],
    [/\s*#\+\w+.*/, 'support'],
    [/#\s+.*/, 'comment'],
  ],
}
