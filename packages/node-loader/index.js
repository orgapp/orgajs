/**
 * @import {LoadFnOutput, LoadHook, LoadHookContext} from 'node:module'
 * @import {ProcessorOptions} from '@orgajs/orgx'
 */

/**
 * @typedef {Parameters<LoadHook>[2]} NextLoad
 *   Next.
 *
 * @typedef {ProcessorOptions} Options
 *   Configuration.
 *
 */

import fs from 'node:fs/promises'
import { reporter } from 'vfile-reporter'
import { VFile } from 'vfile'
import { createProcessor } from '@orgajs/orgx'

/**
 * Create Node.js hooks to handle org files.
 *
 * @param {Readonly<Options> | null | undefined} [loaderOptions]
 *   Configuration (optional).
 * @returns
 *   Node.js hooks.
 */
export function createLoader(loaderOptions) {
	let settings = configure(loaderOptions || {})

	return { initialize, load }

	/**
	 * @param {Readonly<Options> | null | undefined} options
	 */
	async function initialize(options) {
		settings = configure({ ...loaderOptions, ...options })
	}

	/**
	 * Load `file:` URLs to MD(X) files.
	 *
	 * @param {string} href
	 *   URL.
	 * @param {LoadHookContext} context
	 *   Context.
	 * @param {NextLoad} nextLoad
	 *   Next or default `load` function.
	 * @returns {Promise<LoadFnOutput>}
	 *   Result.
	 * @satisfies {LoadHook}
	 */
	async function load(href, context, nextLoad) {
		const url = new URL(href)
		const { compile } = settings

		if (url.protocol === 'file:' && /.org$/.test(url.pathname)) {
			const value = await fs.readFile(url)
			const file = await compile(new VFile({ value, path: url }))
			if (file.messages.length > 0) {
				console.error(reporter(file))
			}
			let source = String(file)
			// source +=
			//   '\n//# sourceMappingURL=data:application/json;base64,' +
			//   Buffer.from(JSON.stringify(file.map)).toString('base64') +
			//   '\n'

			return {
				format: 'module',
				shortCircuit: true,
				source,
			}
		}

		return nextLoad(href, context)
	}
}

/**
 * @param {Options} options
 */
function configure(options) {
	const processor = createProcessor({
		development: true,
		...options,
		// SourceMapGenerator,
	})

	/**
	 * @param {import('vfile').Compatible} file
	 */
	function compile(file) {
		return processor.process(file)
	}

	return { compile }
}

const defaultLoader = createLoader()

/**
 * Pass options to the loader.
 */
export const initialize = defaultLoader.initialize

/**
 * Load `file:` URLs to org files.
 */
export const load = defaultLoader.load
