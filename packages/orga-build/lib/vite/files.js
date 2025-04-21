import { globby } from 'globby'
import path from 'node:path'

/**
 * @param {string} dir
 */
export function setup(dir) {
	return {
		pages,
		components,
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

	async function components() {
		const files = await globby(['_components.{tsx,jsx}'], {
			cwd: dir,
		})
		return files[0] ? path.join(dir, files[0]) : null
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
