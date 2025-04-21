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

export async function ensureDir(path) {
	console.log(`ensureDir: ${path}`)
	try {
		await fs.mkdir(path, { recursive: true })
	} catch (e) {
		if (e.code !== 'EEXIST') {
			throw e
		}
	}
}

export async function copy(src, dest) {
	console.log(`copy: ${src} -> ${dest}`)
	await fs.mkdir(dest, { recursive: true })
	await fs.cp(src, dest, { recursive: true })
}

