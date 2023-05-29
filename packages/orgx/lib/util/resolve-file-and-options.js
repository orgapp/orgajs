/**
 * @typedef {import('vfile').VFileCompatible} VFileCompatible
 * @typedef {import('../core.js').ProcessorOptions} ProcessorOptions
 * @typedef {import('../compile.js').CompileOptions} CompileOptions
 */

import { VFile } from 'vfile'

/**
 * Create a file and options from a given `vfileCompatible` and options that
 * might contain `format: 'detect'`.
 *
 * @param {VFileCompatible} vfileCompatible
 * @param {CompileOptions | null | undefined} [options]
 * @returns {{file: VFile, options: ProcessorOptions}}
 */
export function resolveFileAndOptions(vfileCompatible, options) {
  const file = looksLikeAVFile(vfileCompatible)
    ? vfileCompatible
    : new VFile(vfileCompatible)
  return {
    file,
    options: {
      ...options,
    },
  }
}

/**
 * @param {VFileCompatible | null | undefined} [value]
 * @returns {value is VFile}
 */
function looksLikeAVFile(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'message' in value &&
      'messages' in value
  )
}
