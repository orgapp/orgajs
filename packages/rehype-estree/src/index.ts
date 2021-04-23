import { Transformer } from 'unified'
import toEstree from './hast-to-estree'
import { DEFAULT_OPTIONS, Options } from './options'

function rehype2estree (options: Partial<Options> = {}): Transformer {
  return transformer

  function transformer(node, file) {
    return toEstree(node, { ...DEFAULT_OPTIONS, ...options })
  }
}

export = rehype2estree
