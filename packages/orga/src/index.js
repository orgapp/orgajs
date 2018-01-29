import Parser from './parser'

function parse(string, options = require('./defaults')) {
  const parser = new Parser(options)
  return parser.parse(string)
}

parse.Parser = Parser

function parse(options) {
  this.Parser = Parser
}
module.exports = parse
