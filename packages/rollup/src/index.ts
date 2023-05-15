import { VFile } from 'vfile'
import { createFilter, type FilterPattern } from '@rollup/pluginutils'
import { createProcessor, type CompileOptions } from '@orgajs/orgx'
import { SourceMapGenerator } from 'source-map'
import type { Plugin, SourceDescription } from 'rollup'

interface RollupPluginOptions {
  include: FilterPattern
  exclude: FilterPattern
}

interface Options extends CompileOptions, RollupPluginOptions {}

/**
 * Compile org-mode w/ rollup.
 */
export default function (
  options: Options | null | undefined = undefined
): Plugin {
  const { include, exclude, ...rest } = options || {}
  const processor = createProcessor({
    // SourceMapGenerator,
    ...rest,
    SourceMapGenerator,
  })
  const filter = createFilter(include, exclude)

  return {
    name: '@orgajs/rollup',
    async transform(value, path) {
      const file = new VFile({ value, path })

      if (file.extname && filter(file.path)) {
        const compiled = await processor.process(file)
        const code = String(compiled.value)
        const result: SourceDescription = { code, map: compiled.map }
        return result
      }
    },
  }
}
