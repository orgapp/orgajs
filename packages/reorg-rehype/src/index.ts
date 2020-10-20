import { Processor, Transformer } from 'unified'
import toHAST, { Options } from 'oast-to-hast'

function reorg2rehype (options: Options): Transformer {
  return transformer
  function transformer(node) {
    return toHAST(node, options)
  }
}

export = reorg2rehype

