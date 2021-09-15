import { createProcessor } from './processor'

export function compile(file, options) {
  return createProcessor(options).process(file)
}

export function compileSync(file, options) {
  return createProcessor(options).processSync(file)
}
