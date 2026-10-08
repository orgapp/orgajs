import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @typedef {Object} Config
 * @property {string} outDir
 * @property {string} root
 * @property {import('vite').PluginOption[]} vitePlugins - Array of Vite plugins
 * @property {string[]|string} containerClass
 * @property {string[]} [styles] - Global stylesheet URLs linked from the HTML shell
 * @property {import('unified').PluggableList} [rehypePlugins] - Extra rehype plugins appended to orga-build defaults
 * @property {string[]} [exclude] - Glob patterns for files to exclude from content scanning
 */

/** @type {Config} */
const defaultConfig = {
	outDir: '.out',
	root: '.',
	vitePlugins: [],
	containerClass: [],
	styles: [],
	rehypePlugins: [],
	exclude: []
}

/**
 * @param {string[]} files
 * @returns {Promise<{ config: Config, projectRoot: string }>}
 */
export async function loadConfig(...files) {
	const cwd = process.cwd()

	/**
	 * @param {string} value
	 */
	const resolveConfigPath = (value) =>
		path.isAbsolute(value) ? value : path.resolve(cwd, value)

	let result = { ...defaultConfig }
	let configPath = null

	for (const file of files) {
		const filePath = path.join(cwd, file)

		try {
			await fs.access(filePath, fs.constants.F_OK)
		} catch {
			// File doesn't exist, try next
			continue
		}

		// A broken config file fails the command rather than falling back to defaults.
		const module = await import(filePath)
		// Support both default export (recommended) and named exports
		result = { ...defaultConfig, ...(module.default || module) }
		configPath = filePath
		break
	}

	result.root = resolveConfigPath(result.root)
	result.outDir = resolveConfigPath(result.outDir)
	const styles = result.styles
	result.styles = Array.isArray(styles)
		? styles
				.filter((v) => typeof v === 'string')
				.map((v) => '/' + v.replace(/^\/+/, ''))
		: []
	return {
		config: result,
		projectRoot: configPath ? path.dirname(configPath) : cwd
	}
}
