var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

export function escape(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(matchOperatorsRe, '\\$&')
}


