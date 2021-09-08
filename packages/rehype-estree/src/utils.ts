export const removeQuotes = (text: string) =>
  text.trim().replace(/^["'](.+(?=["']$))["']$/, '$1')
