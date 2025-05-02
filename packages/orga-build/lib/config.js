import fs from 'node:fs/promises'
import path from 'node:path'
import { resolvePath } from './fs.js'

/**
 * @typedef {Object} ViteConfig
 * @property {import('vite').PluginOption[]} plugins
 */

/**
 * @typedef {Object} Config
 * @property {string} outDir
 * @property {string} root
 * @property {string[]} preBuild
 * @property {string[]} postBuild
 * @property {ViteConfig} vite
 */

/** @type {Config} */
const defaultConfig = {
	outDir: 'out',
	root: 'pages',
	preBuild: [],
	postBuild: [],
	vite: {
		plugins: []
	}
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
