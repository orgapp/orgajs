export const tokenizer = {
  root: [
    [/^(\*+)\s+(.*)$/, 'keyword'],
    [/\s*#\+\w+.*/, 'comment'],
  ],
}
