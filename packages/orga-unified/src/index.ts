import { parse, ParseOptions } from 'orga'

export = function (options: Partial<ParseOptions>) {
  this.Parser = (doc: string, file) => {
    return parse(doc, options)
  }
}
