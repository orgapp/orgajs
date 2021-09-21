import type { VFileCompatible } from 'vfile'
import { compile } from './compile'
import { ProcessorOptions } from './processor'

type EvaluateProcessorOptions = Omit<
  ProcessorOptions,
  'jsx' | 'jsxImportSource'
>

interface OrgaContentProps extends Record<string, unknown> {
  components: Record<string, unknown>
}
type OrgaContent = (props: OrgaContentProps) => unknown
interface ExportMap extends Record<string, unknown> {
  default: OrgaContent
}

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
