import { globby } from 'globby'
import path from 'node:path'

/**
 * @typedef {Object} Page
 * @property {string} dataPath
 *   Path to the page data file
 */

/**
 * @param {string} dir
 */
export function setup(dir) {
	const pages = cache(async function () {
		const files = await globby(
			[
				'**/*.{org,tsx,jsx}',
				'!**/_*/**',
				'!**/_*',
				'!**/.*/**',
				'!**/.*',
				'!node_modules/**',
				'!out/**'
			],
			{ cwd: dir }
		)

		/** @type {Record<string, Page>} */
		const pages = {}
		for (const file of files) {
			const pageId = getPagePublicPath(file)
			pages[pageId] = {
				dataPath: path.join(dir, file)
			}
		}

		return pages
	})

	const layouts = cache(async function () {
		const layoutFiles = await globby(
			[
				'**/_layout.{tsx,jsx}',
				'!**/.*/**',
				'!**/.*',
				'!node_modules/**',
				'!out/**'
			],
			{
				cwd: dir
			}
		)

		return layoutFiles.reduce(
			(/** @type {Record<string, string>} */ result, file) => {
				const layoutPath = path.dirname(getPagePublicPath(file))
				result[layoutPath] = path.join(dir, file)
				return result
			},
			/** @type {Record<string, string>} */ {}
		)
	})

	const components = cache(async function () {
		const files = await globby(
			[
				'_components.{tsx,jsx}',
				'!**/.*/**',
				'!**/.*',
				'!node_modules/**',
				'!out/**'
			],
			{
				cwd: dir
			}
		)
		return files[0] ? path.join(dir, files[0]) : null
	})

	return {
		pages,
		page,
		components,
		layouts
	}

	/** @param {string} id */
	async function page(id) {
		const all = await pages()
		return all[id]
	}
}

/**
 * Creates a cached version of an async function that will only execute once
 * and return the cached result on subsequent calls
 *
 * @template T
 * @param {() => Promise<T>} fn - The async function to cache
 * @returns {() => Promise<T>} - Cached function that returns the same type as the input function
 */
function cache(fn) {
	/** @type {T | null} */
	let cache = null
	return async function () {
		if (cache) {
			return cache
		}
		cache = await fn()
		return cache
	}
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
