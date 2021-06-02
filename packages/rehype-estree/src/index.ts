import { Transformer } from 'unified'
import toEstree from './hast-to-estree'
import { DEFAULT_OPTIONS, Options } from './options'
import processEstree from './process-estree'

function rehype2estree (options: Partial<Options> = {}): Transformer {
  return transformer

  function transformer(node, file) {
    const _options = { ...DEFAULT_OPTIONS, ...options }
    const estree = toEstree(node, _options)
    return processEstree(estree, _options)
  }
}

export = rehype2estree
