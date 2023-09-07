/**
 * @typedef {import('./types.js').OrgModule} ExportMap
 * @typedef {import('vfile').VFileCompatible} VFileCompatible
 * @typedef {import('./util/resolve-evaluate-options.js').EvaluateOptions} EvaluateOptions
 */

import { compile, compileSync } from './compile.js'
import { run, runSync } from './run.js'
import { resolveEvaluateOptions } from './util/resolve-evaluate-options.js'

/**
 * Evaluate Org Content.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {EvaluateOptions} evaluateOptions
 *   Configuration for evaluation.
 * @return {Promise<ExportMap>}
 *   Export map.
 */
export async function evaluate(vfileCompatible, evaluateOptions) {
  const { compiletime, runtime } = resolveEvaluateOptions(evaluateOptions)
  return run(await compile(vfileCompatible, compiletime), runtime)
}

/**
 * Synchronously evaluate MDX.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {EvaluateOptions} evaluateOptions
 *   Configuration for evaluation.
 * @return {ExportMap}
 *   Export map.
 */
export function evaluateSync(vfileCompatible, evaluateOptions) {
  const { compiletime, runtime } = resolveEvaluateOptions(evaluateOptions)
  return runSync(compileSync(vfileCompatible, compiletime), runtime)
}
