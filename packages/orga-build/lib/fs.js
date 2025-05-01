import fs from 'fs/promises'
import path from 'node:path'

/**
 * Resolves a path to an absolute path, even if it's already absolute
 * @param {string} rootPath - The path to resolve
 * @returns {string} - The absolute path
 */
export function resolvePath(rootPath) {
	if (!rootPath) {
		return process.cwd()
	}

	// If it's already absolute, return it as is
	if (path.isAbsolute(rootPath)) {
		return rootPath
	}

	// Otherwise, resolve it relative to the current working directory
	return path.resolve(process.cwd(), rootPath)
}

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function exists(path) {
	try {
		await fs.access(path)
		return true
	} catch {
		return false
	}
}

/**
 * @param {string} dir
 * @returns {Promise<void>}
 */
export async function emptyDir(dir) {
	/** @type {string[]} */
	let items = []
	try {
		items = await fs.readdir(dir)
	} catch {
		await fs.mkdir(dir, { recursive: true })
	}

	await Promise.all(
		items.map((item) => fs.rm(`${dir}/${item}`, { recursive: true }))
	)
}

/**
 * @param {string} path
 */
export async function ensureDir(path) {
	try {
		await fs.mkdir(path, { recursive: true })
	} catch (/** @type{any} */ e) {
		if (e && typeof e === 'object' && 'code' in e && e.code !== 'EEXIST') {
			throw e
		}
	}
}

/**
 * @param {string} src
 * @param {string} dest
 */
export async function copy(src, dest) {
	await fs.mkdir(dest, { recursive: true })
	await fs.cp(src, dest, { recursive: true })
}
