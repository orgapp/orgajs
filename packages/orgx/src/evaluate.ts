import type { VFileCompatible } from 'vfile'
import { compile, compileSync } from './compile.js'
import { ProcessorOptions } from './processor.js'
import { OrgaContent } from './types.js'

export interface ExportMap extends Record<string, unknown> {
  default: OrgaContent
}

type EvaluateProcessorOptions = Omit<
  ProcessorOptions,
  'jsx' | 'jsxImportSource'
>

export interface EvaluateOptions
  extends RuntimeOptions,
    Partial<EvaluateProcessorOptions> {}

export interface RuntimeOptions {
  Fragment: unknown
  jsx: unknown
  jsxs: unknown
  useOrgaComponents?: unknown
}

const resolveOptions = (
  options: EvaluateOptions
): {
  compiletime: Partial<ProcessorOptions>
  runtime: RuntimeOptions
} => {
  const { jsx, Fragment, jsxs, useOrgaComponents, ...rest } = options
  return {
    compiletime: {
      ...rest,
      outputFormat: 'function-body',
      providerImportSource: useOrgaComponents ? '#' : undefined,
    },
    runtime: { jsx, Fragment, jsxs, useOrgaComponents },
  }
}

export const evaluate = async (
  file: VFileCompatible,
  options: EvaluateOptions
): Promise<ExportMap> => {
  const { compiletime, runtime } = resolveOptions(options)
  const code = await compile(file, compiletime)
  return new Function(String(code))(runtime)
}

export const evaluateSync = (
  file: VFileCompatible,
  options: EvaluateOptions
): ExportMap => {
  const { compiletime, runtime } = resolveOptions(options)
  const code = compileSync(file, compiletime)
  return new Function(String(code))(runtime)
}
