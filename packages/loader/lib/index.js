/**
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 */

import path from 'node:path'
import { createProcessor } from '@orgajs/orgx'

/**
 * @param {string} source
 * @param {LoaderContext['callback']} callback
 * @this {LoaderContext}
 */
export async function loader(source, callback) {
	const processor = createProcessor({
		development: this.mode === 'development',
		...this.getOptions()
	})

	try {
		const file = await processor.process({
			value: source,
			path: this.resourcePath
		})
		callback(undefined, file.value, file.map)
	} catch (error) {
		const fpath = path.relative(this.context, this.resourcePath)
		error.message = `${fpath}:${error.name}: ${error.message}`
		callback(error)
	}
}
