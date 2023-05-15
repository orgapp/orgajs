import { toJs, jsx } from 'estree-util-to-js'
import type { CompilerFunction, Plugin } from 'unified'
import type { Program } from 'estree-jsx'

type SourceMapGenerator = typeof import('source-map').SourceMapGenerator

export interface Options {
  SourceMapGenerator?: SourceMapGenerator
}

/**
 * A plugin that adds an esast compiler: a small wrapper around `astring` to add
 * support for serializing JSX.
 */
export function estreeStringify(options: Options) {
  const { SourceMapGenerator } = options || {}

  const compiler: CompilerFunction<Program, string> = (tree, file) => {
    const result = SourceMapGenerator
      ? toJs(tree, {
          filePath: file.path || 'unknown.org',
          SourceMapGenerator,
          handlers: jsx,
        })
      : toJs(tree, { handlers: jsx })

    file.map = result.map

    return result.value
  }

  Object.assign(this, { Compiler: compiler })
}
