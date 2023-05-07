import { Transformer } from 'unified'
import { toEstree, Options } from 'hast-util-to-estree'

export type { Options }

function rehype2estree(options: Partial<Options> = {}): Transformer {
  return (tree) => toEstree(tree, options)
}

export default rehype2estree
