var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

function escape(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(matchOperatorsRe, '\\$&')
}

module.exports = { escape }
