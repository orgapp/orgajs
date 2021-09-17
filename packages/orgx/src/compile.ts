import { createProcessor, Options } from './processor'
import type { VFileCompatible } from 'vfile'

export function compile(file: VFileCompatible, options: Partial<Options>) {
  return createProcessor(options).process(file)
}

export function compileSync(file: VFileCompatible, options: Partial<Options>) {
  return createProcessor(options).processSync(file)
}
