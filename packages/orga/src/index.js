import Parser from './parser'

function parse(string, options = require('./defaults')) {
  const parser = Parser(options)
  parser.parse(string)
}

module.exports = parse
