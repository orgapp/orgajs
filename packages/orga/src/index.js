const Parser = require('./parser')

function parse(string, options = require('./defaults')) {
  const parser = new Parser(options)
  return parser.parse(string)
}

module.exports = {
  Parser,
  parse,
}
