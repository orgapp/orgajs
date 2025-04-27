import fs from 'fs/promises'

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
