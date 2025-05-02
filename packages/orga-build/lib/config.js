import fs from 'node:fs/promises'
import path from 'node:path'
import { resolvePath } from './fs.js'

/**
 * @typedef {Object} Config
 * @property {string} outDir
 * @property {string} root
 * @property {string[]} preBuild
 * @property {string[]} postBuild
 * @property {import('vite').PluginOption[]} vitePlugins - Array of Vite plugins
 */

/** @type {Config} */
const defaultConfig = {
	outDir: 'out',
	root: 'pages',
	preBuild: [],
	postBuild: [],
	vitePlugins: []
}

/**
 * @param {string} cwd
 * @param {string[]} files
 * @returns {Promise<Config>}
 */
export async function loadConfig(cwd, ...files) {
	for (const file of files) {
		const filePath = path.join(cwd, file)

		try {
			await fs.access(filePath, fs.constants.F_OK)
			const config = await import(filePath)
			const result = { ...defaultConfig, ...config }
			result.root = resolvePath(result.root)
			result.outDir = resolvePath(result.outDir)
			return result
		} catch (err) {
			console.error(err)
		}
	}
	return defaultConfig
}
