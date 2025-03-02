/**
 * @import {PluginBuild} from 'esbuild'
 */

import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)
const reactPath = require.resolve('react')
const reactDirPath = path.dirname(reactPath)

const resolveReact = {
	name: 'resolve-react',
	/**
	 * @param {PluginBuild} build
	 *   Build.
	 * @returns {undefined}
	 *   Nothing.
	 */
	setup(build) {
		build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => {
			return { path: path.join(reactDirPath, 'jsx-runtime.js') }
		})
	}
}

export default resolveReact
