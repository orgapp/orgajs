import { parse, ParseOptions } from 'orga'
import { Plugin } from 'unified'

const _parse: Plugin = function(options: Partial<ParseOptions>) {
  this.Parser = (doc: string) => {
    return parse(doc, options)
  }
}

export default _parse
