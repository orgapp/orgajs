import toJs from './estree-to-js'
import { DEFAULT_OPTIONS, Options } from './options'
import processEstree from './process-estree'

function estree2jsx (options: Partial<Options> = {}) {

  const settings = { ...DEFAULT_OPTIONS, ...options }

  function compiler(tree) {
    const processed = processEstree(tree, settings)
    const js = toJs(processed)
    return `${settings.renderer}${settings.pragma}${js}`
  }

  this.Compiler = compiler
}

export = estree2jsx
