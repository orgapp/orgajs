import fs from 'node:fs/promises'
import { reporter } from 'vfile-reporter'
import { VFile } from 'vfile'
import { createProcessor } from '@orgajs/orgx'

export function createLoader(loaderOptions) {
	/** @type {Settings} */
	let settings = configure(loaderOptions || {})

	return { initialize, load }

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

function configure(options) {
	const processor = createProcessor({
		development: true,
		...options,
		// SourceMapGenerator,
	})
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
