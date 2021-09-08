import { Transformer } from 'unified'
import toEstree from './hast-to-estree'
import { DEFAULT_OPTIONS, Options } from './options'
import processEstree from './process-estree'

export type { Options }

function rehype2estree(options: Partial<Options> = {}): Transformer {
  return transformer

  function transformer(node, file) {
    const _options = { ...DEFAULT_OPTIONS, ...options }
    const layout = node.data.layout
    if (typeof layout === 'string') {
      const _layout = layout.trim().replace(/["']/g, '')
      if (['', 'nil', 'undefined', 'null'].includes(_layout)) {
        _options.defaultLayout = undefined
      } else {
        _options.defaultLayout = layout
      }
    }

    const estree = toEstree(node, _options)
    return processEstree(estree, _options)
  }
}

export default rehype2estree
