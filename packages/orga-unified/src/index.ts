import { Parser as OrgaParser } from 'orga'

function Parser(doc, file) {
  this.file = file
  this._parser = new OrgaParser()
}

Parser.prototype.parse = function() {
  return this._parser.parse(String(this.file))
}

export = parse
parse.Parser = Parser

function parse(options) {
  this.Parser = Parser
}
