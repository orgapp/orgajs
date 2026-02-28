import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { globby } from 'globby'
import { getSettings } from 'orga'

/**
 * @typedef {Object} Page
 * @property {string} dataPath
 * @property {string} [title]
 *   Path to the page data file
 */

/**
 * @typedef {Object} EndpointRoute
 * @property {string} route
 * @property {string} dataPath
 */

/**
 * @typedef {Object} ContentEntry
 * @property {string} id
 * @property {string} slug
 * @property {string} path
 * @property {string} filePath
 * @property {'org' | 'tsx' | 'jsx'} ext
 * @property {Record<string, unknown>} data
 */

/**
 * Extract file extension from file path
 * @param {string} filePath
 * @returns {'org' | 'tsx' | 'jsx'}
 */
function getFileExtension(filePath) {
	const match = filePath.match(/\.(org|tsx|jsx)$/)
	return /** @type {'org' | 'tsx' | 'jsx'} */ (match ? match[1] : 'org')
}

/**
 * Derive content path from slug
 * @param {string} slug - e.g. '/writing/foo', '/content/writing/2025/post', '/'
 * @returns {string} - e.g. 'writing', 'content/writing/2025', ''
 */
function getContentPath(slug) {
	// Remove leading slash
	let normalized = slug.replace(/^\/+/, '')
	// Remove trailing slash
	normalized = normalized.replace(/\/+$/, '')

	// If root page, return empty string
	if (!normalized) {
		return ''
	}

	// Get all segments except the last one (the file name)
	const segments = normalized.split('/')
	if (segments.length === 1) {
		// Single segment like '/about' -> path is empty (root level)
		return ''
	}

	// Multiple segments like '/writing/foo' -> path is 'writing'
	return segments.slice(0, -1).join('/')
}

/**
 * Derive content id from slug
 * @param {string} slug - e.g. '/writing/foo', '/writing', '/'
 * @returns {string} - e.g. 'foo', 'writing', 'index'
 */
function getContentId(slug) {
	// Remove leading and trailing slashes
	const normalized = slug.replace(/^\/+/, '').replace(/\/+$/, '')

	// If root page, return 'index'
	if (!normalized) {
		return 'index'
	}

	// Get last segment
	const segments = normalized.split('/')
	return segments[segments.length - 1] || 'index'
}

/**
 * @param {string} dir
 * @param {object} [options]
 * @param {string} [options.outDir] - Output directory to exclude from file discovery
 */
export function setup(dir, { outDir } = {}) {
	const outDirRelative = outDir ? path.relative(dir, outDir) : null
	// Only exclude outDir if it's inside the root (not an external path like ../out)
	const outDirExclude =
		outDirRelative && !outDirRelative.startsWith('..')
			? `!${outDirRelative}/**`
			: null

	const discoveredRoutes = cache(async function () {
		const files = await globby(
			[
				'**/*.{org,tsx,jsx,ts,js,mts,mjs}',
				'!**/_*/**',
				'!**/_*',
				'!**/.*/**',
				'!**/.*',
				'!node_modules/**',
				...(outDirExclude ? [outDirExclude] : [])
			],
			{ cwd: dir }
		)

		/** @type {Record<string, Page>} */
		const pages = {}
		/** @type {Record<string, EndpointRoute>} */
		const endpoints = {}
		/** @type {Map<string, { sourceType: 'page' | 'endpoint', filePath: string }>} */
		const routeOwners = new Map()

		for (const file of files) {
			const absolutePath = path.join(dir, file)
			const pageSlug = getPageSlugFromFilePath(file)
			const endpointRoute = getEndpointRouteFromFilePath(file)

			if (pageSlug) {
				assertUniqueRoute(routeOwners, pageSlug, 'page', absolutePath)
				pages[pageSlug] = { dataPath: absolutePath }
			}

			if (endpointRoute) {
				assertUniqueRoute(routeOwners, endpointRoute, 'endpoint', absolutePath)
				endpoints[endpointRoute] = {
					route: endpointRoute,
					dataPath: absolutePath
				}
			}
		}

		return { pages, endpoints }
	})

	const pages = cache(async function () {
		const routes = await discoveredRoutes()
		return routes.pages
	})

	const endpoints = cache(async function () {
		const routes = await discoveredRoutes()
		return routes.endpoints
	})

	const layouts = cache(async function () {
		const layoutFiles = await globby(
			[
				'**/_layout.{tsx,jsx}',
				'!**/.*/**',
				'!**/.*',
				'!node_modules/**',
				...(outDirExclude ? [outDirExclude] : [])
			],
			{
				cwd: dir
			}
		)

		return layoutFiles.reduce(
			(/** @type {Record<string, string>} */ result, file) => {
				const layoutSlug = path.dirname(getSlugFromContentFilePath(file))
				result[layoutSlug] = path.join(dir, file)
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
				...(outDirExclude ? [outDirExclude] : [])
			],
			{
				cwd: dir
			}
		)
		return files[0] ? path.join(dir, files[0]) : null
	})

	const contentEntries = cache(async function () {
		const allPages = await pages()
		/** @type {ContentEntry[]} */
		const entries = []

		for (const [slug, pageData] of Object.entries(allPages)) {
			const filePath = pageData.dataPath
			const ext = getFileExtension(filePath)

			// Derive path from directory structure
			const derivedPath = getContentPath(slug)

			// Derive id from the slug (last segment or 'index')
			const id = getContentId(slug)

			/** @type {Record<string, unknown>} */
			let data = {}

			// Extract metadata from .org files
			if (ext === 'org') {
				try {
					const content = await readFile(filePath, 'utf-8')
					data = getSettings(content)
				} catch (/** @type {any} */ error) {
					console.warn(
						`Failed to read metadata from ${filePath}:`,
						error?.message || error
					)
				}
			}

			entries.push({
				id,
				slug,
				path: derivedPath,
				filePath,
				ext,
				data
			})
		}

		return entries
	})

	const files = {
		pages,
		page,
		endpoints,
		endpoint,
		components,
		layouts,
		contentEntries,
		invalidate() {
			discoveredRoutes.invalidate()
			pages.invalidate()
			endpoints.invalidate()
			layouts.invalidate()
			components.invalidate()
			contentEntries.invalidate()
		}
	}

	return files

	/** @param {string} slug */
	async function page(slug) {
		const all = await pages()
		return all[slug]
	}

	/** @param {string} route */
	async function endpoint(route) {
		const all = await endpoints()
		return all[route]
	}
}

/**
 * Creates a cached version of an async function that will only execute once
 * and return the cached result on subsequent calls. The returned function
 * also has an `invalidate()` method to clear the cache.
 *
 * @template T
 * @param {() => Promise<T>} fn - The async function to cache
 * @returns {(() => Promise<T>) & { invalidate: () => void }}
 */
function cache(fn) {
	let settled = false
	/** @type {T | undefined} */
	let value
	/** @returns {Promise<T>} */
	async function cached() {
		if (!settled) {
			value = await fn()
			settled = true
		}
		return /** @type {T} */ (value)
	}
	cached.invalidate = function () {
		settled = false
		value = undefined
	}
	return cached
}

/**
 * Convert a content file path (relative to content root) to the canonical page slug.
 * @param {string} contentFilePath
 */
export function getSlugFromContentFilePath(contentFilePath) {
	const normalizedFilePath = contentFilePath.replace(/\\/g, '/')
	let slug = normalizedFilePath.replace(/\.(org|md|mdx|js|jsx|ts|tsx)$/, '')
	slug = slug.replace(/index$/, '')
	// remove trailing slash
	slug = slug.replace(/\/$/, '')
	// ensure starting slash
	slug = slug.replace(/^\//, '')
	slug = `/${slug}`

	// turn [id] into :id
	// so that react-router can recognize it as url params
	// pagePublicPath = pagePublicPath.replace(
	// 	/\[(.*?)\]/g,
	// 	(_, paramName) => `:${paramName}`
	// )

	return slug
}

/**
 * @param {string} filePath
 * @returns {string|null}
 */
function getPageSlugFromFilePath(filePath) {
	if (!/\.(org|tsx|jsx)$/.test(filePath)) {
		return null
	}
	return getSlugFromContentFilePath(filePath)
}

/**
 * @param {string} filePath
 * @returns {string|null}
 */
function getEndpointRouteFromFilePath(filePath) {
	if (!/\.(ts|js|mts|mjs)$/.test(filePath)) {
		return null
	}

	const normalizedFilePath = filePath.replace(/\\/g, '/')
	const targetPath = normalizedFilePath.replace(/\.(ts|js|mts|mjs)$/, '')
	const basename = path.posix.basename(targetPath)

	// Endpoint files must carry a target extension: rss.xml.ts, data.json.ts, etc.
	if (!basename.includes('.')) {
		return null
	}

	return `/${targetPath.replace(/^\/+/, '')}`
}

/**
 * @param {Map<string, { sourceType: 'page' | 'endpoint', filePath: string }>} routeOwners
 * @param {string} route
 * @param {'page' | 'endpoint'} sourceType
 * @param {string} filePath
 */
function assertUniqueRoute(routeOwners, route, sourceType, filePath) {
	const existing = routeOwners.get(route)
	if (existing) {
		throw new Error(
			`Route conflict detected for "${route}"\n- ${existing.sourceType}: ${existing.filePath}\n- ${sourceType}: ${filePath}`
		)
	}
	routeOwners.set(route, { sourceType, filePath })
}
