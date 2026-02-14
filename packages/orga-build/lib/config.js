import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @typedef {Object} Config
 * @property {string} outDir
 * @property {string} root
 * @property {string[]} preBuild
 * @property {string[]} postBuild
 * @property {import('vite').PluginOption[]} vitePlugins - Array of Vite plugins
 * @property {string[]|string} containerClass
 */

/** @type {Config} */
const defaultConfig = {
	outDir: '.out',
	root: '.',
	preBuild: [],
	postBuild: [],
	vitePlugins: [],
	containerClass: []
}

/**
 * @param {string[]} files
 * @returns {Promise<Config>}
 */
export async function loadConfig(...files) {
	const cwd = process.cwd()

	/**
	 * @param {string} value
	 */
	const resolveConfigPath = (value) =>
		path.isAbsolute(value) ? value : path.resolve(cwd, value)

	let result = { ...defaultConfig }

	for (const file of files) {
		const filePath = path.join(cwd, file)

		try {
			await fs.access(filePath, fs.constants.F_OK)
		} catch {
			// File doesn't exist, try next
			continue
		}

		try {
			const module = await import(filePath)
			// Support both default export (recommended) and named exports
			const config = module.default || module
			result = { ...defaultConfig, ...config }
			break
		} catch (err) {
			// Config file exists but has errors
			console.error(`Error loading config from ${file}:`, err)
		}
	}

	result.root = resolveConfigPath(result.root)
	result.outDir = resolveConfigPath(result.outDir)
	return result
}
