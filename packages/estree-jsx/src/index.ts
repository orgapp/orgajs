import toJs from './estree-to-js'
import { DEFAULT_OPTIONS, Options } from './options'

function estree2jsx (options: Partial<Options> = {}) {

  const settings = { ...DEFAULT_OPTIONS, ...options }

  function compiler(tree) {
    const js = toJs(tree)
    return `${settings.renderer}${settings.pragma}${js}`
  }

  this.Compiler = compiler
}

export = estree2jsx
