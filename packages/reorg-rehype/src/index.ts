import toHAST, { Options } from 'oast-to-hast'
import { Transformer } from 'unified'

export type { Options }

function reorg2rehype(options: Partial<Options> = {}): Transformer {
  return transformer
  function transformer(node) {
    return toHAST(node, options)
  }
}

export default reorg2rehype
