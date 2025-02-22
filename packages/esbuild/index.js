/**
 * @import { CompileOptions } from '@orgajs/orgx'
 * @import {
      OnLoadResult,
      PluginBuild
 * } from 'esbuild'
 */
import fs from 'node:fs/promises'
import { VFile } from 'vfile'
import { compile } from '@orgajs/orgx'
import { SourceMapGenerator } from 'source-map'

const name = '@orgajs/esbuild'

/**
 * Create Node.js hooks to handle org files.
 *
 * @param {Readonly<CompileOptions> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Node.js hooks.
 */
function esbuild(options) {
	return {
		name,
		setup
	}

	/**
	 * @param {PluginBuild} build
	 *   Build.
	 * @returns {undefined}
	 *   Nothing.
	 */
	function setup(build) {
		build.onLoad({ filter: /\.org$/ }, onload)
	}

	/**
	 * @param {any} data
	 *   Data.
	 * @returns {Promise<OnLoadResult>}
	 *   Result.
	 */
	async function onload(data) {
		const document = String(
			data.pluginData &&
				data.pluginData.contents !== null &&
				data.pluginData.contents !== undefined
				? data.pluginData.contents
				: await fs.readFile(data.path)
		)

		const file = new VFile({ path: data.path, value: document })
		const code = await compile(file, { ...options, SourceMapGenerator })
		const contents =
			String(code) +
			'\n' +
			'//# sourceMappingURL=data:application/json;base64,' +
			Buffer.from(JSON.stringify(file.map)).toString('base64') +
			'\n'

		return {
			contents
		}
	}
}

export default esbuild
