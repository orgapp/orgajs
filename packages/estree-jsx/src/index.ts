import toJs from './estree-to-js'
import { DEFAULT_OPTIONS, Options } from './options'

function estree2jsx(options: Partial<Options> = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options }

  function compiler(tree) {
    const code = toJs(tree)
    return [settings.pragma, settings.renderer, code].join('\n')
  }

  this.Compiler = compiler
}

export = estree2jsx
