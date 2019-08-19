const Parser = require('./parser')
const timestamp = require('./timestamp')

function parse(string, options = require('./defaults')) {
  const parser = new Parser(options)
  return parser.parse(string)
}

module.exports = {
  Parser,
  parse,
  parseTimestamp: timestamp.parse,
}
