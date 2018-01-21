import Node from './node'

function parse(text) {
  // TODO: inline parsing
  return [ new Node(`text`).with({ value: text }) ]
}

module.exports = {
  parse,
}
