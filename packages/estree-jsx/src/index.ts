import toJs from './estree-to-js'
import { DEFAULT_OPTIONS, Options } from './options'

export type { Options }

function estree2jsx(options: Partial<Options> = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options }

  function compiler(tree) {
    const code = toJs(tree)
    return [settings.pragma, settings.renderer, code].join('\n')
  }

  this.Compiler = compiler
}

export default estree2jsx
