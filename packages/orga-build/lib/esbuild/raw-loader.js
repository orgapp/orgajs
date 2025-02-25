/**
 * @import {PluginBuild} from 'esbuild'
 */

import path from 'path'
import { promises as fs } from 'fs'

const rawLoader = {
	name: 'raw',
	/**
	 * @param {PluginBuild} build
	 *   Build.
	 * @returns {undefined}
	 *   Nothing.
	 */
	setup(build) {
		build.onResolve({ filter: /.*\?raw$/ }, (args) => {
			return {
				path: args.path,
				pluginData: {
					isAbsolute: path.isAbsolute(args.path),
					resolveDir: args.resolveDir
				},
				namespace: 'raw-loader'
			}
		})

		build.onLoad(
			{ filter: /.*\?raw$/, namespace: 'raw-loader' },
			async (args) => {
				const fullPath = args.pluginData.isAbsolute
					? args.path
					: path.join(args.pluginData.resolveDir, args.path)
				const contents = await fs.readFile(
					fullPath.replace(/\?raw$/, ''),
					'utf8'
				)
				return {
					contents,
					loader: 'text'
				}
			}
		)
	}
}

export default rawLoader
