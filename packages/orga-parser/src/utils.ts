const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

export const escape = (str: string) => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(matchOperatorsRe, '\\$&')
}
