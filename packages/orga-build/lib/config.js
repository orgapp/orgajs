import fs from 'node:fs/promises'
import path from 'node:path'
import { evaluate } from './esbuild/evaluate.js'

/**
 * @typedef {Object} Options
 * @property {string} [outDir]
 * @property {string[]} [preBuild]
 * @property {string[]} [postBuild]
 */

/** @type {Options} */
const defaultConfig = {
	outDir: 'out',
	preBuild: [],
	postBuild: []
}

/**
 * @param {string} cwd
 * @param {string[]} files
 * @returns {Promise<Options>}
 */
export async function loadConfig(cwd, ...files) {
	for (const file of files) {
		const filePath = path.join(cwd, file)
		try {
			await fs.access(filePath, fs.constants.F_OK)
			const config = await evaluate(filePath)
			return { ...defaultConfig, ...config }
		} catch (err) {}
	}
	return defaultConfig
}
