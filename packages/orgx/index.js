/**
 * @typedef {import('./lib/core.js').ProcessorOptions} ProcessorOptions
 * @typedef {import('./lib/compile.js').CompileOptions} CompileOptions
 * @typedef {import('./lib/evaluate.js').EvaluateOptions} EvaluateOptions
 * @typedef {import('./lib/types.js').OrgComponents} OrgComponents
 * @typedef {import('./lib/types.js').OrgContent} OrgContent
 * @typedef {import('./lib/types.js').OrgModule} OrgModule
 * @typedef {import('./lib/types.js').OrgProps} OrgProps
 */

export { createProcessor } from './lib/core.js'
export { compile, compileSync } from './lib/compile.js'
export { evaluate, evaluateSync } from './lib/evaluate.js'
export { run, runSync } from './lib/run.js'
