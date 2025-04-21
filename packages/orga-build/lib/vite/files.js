import { globby } from 'globby'
import path from 'node:path'

/**
 * @param {string} dir
 */
export function setup(dir) {
	return {
		pages
	}

	async function pages() {
		const files = await globby([
			'**/*.{org,tsx,jsx}',
			'!**/_*/**',
			'!**/_*',
			'!**/.*/**',
			'!**/.*',
			'!node_modules/**',
			'!out/**'
		])

		/** @type {Record<string, object>} */
		const pages = {}
		for (const file of files) {
			const pageId = getPagePublicPath(file)
			pages[pageId] = {
				dataPath: path.join(dir, file)
			}
		}

		return pages
	}

	/**
	 * @param {string} id
	 */
	async function page(id) {}
}

/**
 * @param {string} file
 */
function getPagePublicPath(file) {
	let pagePublicPath = file.replace(/\.(org|md|mdx|js|jsx|ts|tsx)$/, '')
	pagePublicPath = pagePublicPath.replace(/index$/, '')
	// remove trailing slash
	pagePublicPath = pagePublicPath.replace(/\/$/, '')
	// ensure starting slash
	pagePublicPath = pagePublicPath.replace(/^\//, '')
	pagePublicPath = `/${pagePublicPath}`

	// turn [id] into :id
	// so that react-router can recognize it as url params
	// pagePublicPath = pagePublicPath.replace(
	// 	/\[(.*?)\]/g,
	// 	(_, paramName) => `:${paramName}`
	// )

	return pagePublicPath
}
