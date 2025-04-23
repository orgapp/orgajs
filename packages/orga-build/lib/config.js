import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @typedef {Object} Config
 * @property {string} outDir
 * @property {string[]} preBuild
 * @property {string[]} postBuild
 * @property {any[]} vitePlugins
 */

/** @type {Config} */
const defaultConfig = {
	outDir: 'out',
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
			return { ...defaultConfig, ...config }
		} catch (err) {
			console.error(err)
		}
	}
	return defaultConfig
}
