import {
  createProcessor,
  ProcessorOptions as ProcessorOptions,
} from './processor.js'
import type { VFileCompatible } from 'vfile'

export type CompileOptions = ProcessorOptions

export function compile(
  file: VFileCompatible,
  options: Partial<CompileOptions> = {}
) {
  return createProcessor(options).process(file)
}

export function compileSync(
  file: VFileCompatible,
  options: Partial<CompileOptions> = {}
) {
  return createProcessor(options).processSync(file)
}
