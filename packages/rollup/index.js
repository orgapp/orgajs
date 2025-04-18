/**
 * @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern
 * @typedef {import('rollup').Plugin} Plugin
 * @typedef {import('rollup').SourceDescription} SourceDescription
 */

/**
 * @typedef {Omit<import('@orgajs/orgx').CompileOptions, 'SourceMapGenerator'>} CompileOptions
 *   Default configuration.
 *
 * @typedef RollupPluginOptions
 *   Extra configuration.
 * @property {FilterPattern} [include]
 *   List of picomatch patterns to include
 * @property {FilterPattern} [exclude]
 *   List of picomatch patterns to exclude
 *
 * @typedef {CompileOptions & RollupPluginOptions} Options
 *   Configuration.
 */

import { VFile } from 'vfile'
import { createFilter } from '@rollup/pluginutils'
import { createProcessor } from '@orgajs/orgx'
import { SourceMapGenerator } from 'source-map'

/**
 * Compile org-mode w/ rollup.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration.
 * @return {Plugin}
 *   Rollup plugin.
 */
export default function rollup(options) {
	const { include, exclude, ...rest } = options || {}
	const processor = createProcessor({
		SourceMapGenerator,
		...rest
	})
	const filter = createFilter(include, exclude)

	return {
		name: '@orgajs/rollup',
		async transform(value, path) {
			const file = new VFile({ value, path })

			if (file.extname === '.org' && filter(file.path)) {
				const compiled = await processor.process(file)
				const code = String(compiled.value)
				/** @type {SourceDescription} */
				const result = {
					code,
					// @ts-expect-error: `rollup` is not compiled with `exactOptionalPropertyTypes`,
					// so it does not allow `sourceRoot` in `file.map` to be `undefined` here.
					map: compiled.map
				}
				return result
			}
		}
	}
}
