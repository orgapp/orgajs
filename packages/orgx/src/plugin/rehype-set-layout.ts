import type { Plugin, Settings } from 'unified'
import removeQuotes from '../utils/remove-quotes'

export interface Options extends Settings {
  defaultLayout?: string
}

export const rehypeSetLayout: Plugin = (options: Options) => {
  const { defaultLayout } = options
  return (tree) => {
    const { layout } = tree.data

    if (layout && typeof layout === 'string') {
      const _layout = removeQuotes(layout).trim()
      switch (_layout) {
        case 'nil':
        case 'null':
        case 'undefined':
        case '':
          tree.data.layout = undefined
          break
        default:
          tree.data.layout = _layout
      }
    } else if (defaultLayout) {
      tree.data.layout = defaultLayout
    }
  }
}
