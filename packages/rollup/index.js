/**
 * @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern
 * @typedef {import('rollup').SourceDescription} SourceDescription
 * @typedef Plugin
 *   Plugin that is compatible with both Rollup and Vite.
 * @property {string} name
 *   The name of the plugin
 * @property {ViteConfig} config
 *   Function used by Vite to set additional configuration options.
 * @property {Transform} transform
 *   Function to transform the source content.
 *
 * @callback Transform
 *   Callback called by Rollup and Vite to transform.
 * @param {string} value
 *   File contents.
 * @param {string} path
 *   File path.
 * @returns {Promise<SourceDescription | undefined>}
 *   Result.
 *
 * @callback ViteConfig
 *   Callback called by Vite to set additional configuration options.
 * @param {unknown} config
 *   Configuration object (unused).
 * @param {ViteEnv} env
 *   Environment variables.
 * @returns {undefined}
 *   Nothing.
 *
 * @typedef ViteEnv
 *   Environment variables used by Vite.
 * @property {string} mode
 *   Mode.
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
	/** @type {ReturnType<typeof import('@orgajs/orgx').createProcessor>} */
	let processor
	const filter = createFilter(include, exclude)

	return {
		name: '@orgajs/rollup',
		config(config, env) {
			processor = createProcessor({
				SourceMapGenerator,
				development: env.mode === 'development',
				...rest
			})
		},
		async transform(value, path) {
			if (!processor) {
				processor = createProcessor({
					SourceMapGenerator,
					...rest
				})
			}

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
