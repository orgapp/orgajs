import { Transformer } from 'unified'
import toEstree from './hast-to-estree'
import { DEFAULT_OPTIONS, Options } from './options'
import processEstree from './process-estree'
import { removeQuotes } from './utils'

export type { Options }

const getLastValue = (key: string, data: any) => {
  const value = data[key]
  if (!value) return
  if (Array.isArray(value)) {
    return value[value.length - 1]
  }
  return value
}

function rehype2estree(options: Partial<Options> = {}): Transformer {
  return transformer

  function transformer(node, file) {
    const _options = { ...DEFAULT_OPTIONS, ...options }
    const layout = getLastValue('layout', node.data)
    if (typeof layout === 'string') {
      const _layout = removeQuotes(layout)
      if (['', 'nil', 'undefined', 'null'].includes(_layout)) {
        _options.defaultLayout = undefined
      } else {
        _options.defaultLayout = _layout
      }
    }

    const estree = toEstree(node, _options)
    return processEstree(estree, _options)
  }
}

export default rehype2estree
