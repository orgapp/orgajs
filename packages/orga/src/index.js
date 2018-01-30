import Parser from './parser'

function parse(string, options = require('./defaults')) {
  const parser = Parser(options)
  return parser.parse(string)
}

module.exports = {
  Parser,
  parse,
}
