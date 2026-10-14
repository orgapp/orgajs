/**
 * @import {Root as HastTree} from 'hast'
 */
import path from 'node:path'
import _orga from '@orgajs/rollup'
import { visitParents } from 'unist-util-visit-parents'
import { getSlugFromContentFilePath } from './files.js'
import { isLocalPath } from './util.js'

/**
 * @param {Object} options
 * @param {string|string[]} options.containerClass - CSS class name(s) to wrap the rendered content
 * @param {string} options.root - Root directory for content files
 * @param {import('unified').PluggableList} [options.rehypePlugins] - Extra rehype plugins appended to defaults
 * @param {string[]} [options.assetKeywords] - Org keywords holding local file paths
 */
export function setupOrga({
	containerClass,
	root,
	rehypePlugins = [],
	assetKeywords = []
}) {
	/** Vite's `base`, set once the config resolves. */
	const site = { base: '/' }
	/** @type {import('vite').Plugin} */
	const base = {
		name: 'orga-build:base',
		configResolved(config) {
			site.base = config.base
		}
	}
	return [
		base,
		_orga({
			rehypePlugins: [
				[rehypeWrap, { className: containerClass }],
				[rewriteOrgFileLinks, { root, site }],
				[mediaAssets, { keywords: assetKeywords }],
				...rehypePlugins
			]
		})
	]
}

// --- plugins ---

/**
 * Import local images and videos, and the files named by `keywords`, so Vite
 * resolves, hashes and emits them.
 *
 * @param {Object} options
 * @param {string[]} options.keywords - Org keywords holding file paths, e.g. `image`
 */
function mediaAssets({ keywords }) {
	/**
	 * @param {any} tree
	 */
	return function (tree) {
		/** @type {Record<string, string>} */
		const imports = {}
		/** @param {string} src */
		const importName = (src) => (imports[src] ??= `asset_${genId()}`)

		visitParents(tree, [{ tagName: 'img' }, { tagName: 'video' }], (node) => {
			const { src, ...rest } = node.properties
			if (!isLocalPath(src)) return
			node.type = 'jsx'
			const tagName = node.tagName
			const name = importName(src)
			const attrs = Object.entries(rest)
				.filter(([, v]) => v !== undefined && v !== false)
				.map(([k, v]) =>
					v === true ? k : `${k}={${JSON.stringify(String(v))}}`
				)
				.join(' ')
			node.value = `<${tagName} src={${name}}${attrs ? ` ${attrs}` : ''}/>`
		})

		// Export the imported URL instead of the literal path `rehype-recma`
		// would export from `tree.data`. Each jsx node is parsed on its own, so
		// `export { asset as key }` fails: the import isn't in scope there.
		const data = tree.data ?? {}
		for (const key of keywords) {
			const src = data[key]
			if (!isLocalPath(src)) continue
			delete data[key]
			tree.children.unshift({
				type: 'jsx',
				value: `export const ${key} = ${importName(src)}`,
				children: []
			})
		}

		for (const [src, name] of Object.entries(imports)) {
			tree.children.unshift({
				type: 'jsx',
				value: `import ${name} from ${JSON.stringify(src)}`,
				children: []
			})
		}
	}
}

/**
 * @param {Object} options
 * @param {string[]} options.className
 */
function rehypeWrap({ className = [] }) {
	/**
	 * Transform.
	 *
	 * @param {HastTree} tree
	 *   Tree.
	 * @returns {HastTree}
	 *   Nothing.
	 */
	return (tree) => {
		return {
			...tree,
			children: [
				{
					type: 'element',
					tagName: 'div',
					properties: {
						className
					},
					// @ts-expect-error
					children: tree.children
				}
			]
		}
	}
}

/**
 * Point links to `.org` files at their pages, keeping any `#fragment`.
 *
 * @param {Object} options
 * @param {string} options.root
 * @param {{ base: string }} options.site
 */
function rewriteOrgFileLinks({ root, site }) {
	/**
	 * @param {any} tree
	 * @param {import('vfile').VFile} [file]
	 */
	return function (tree, file) {
		const filePath = file?.path
		if (!filePath) return

		visitParents(tree, { tagName: 'a' }, (node) => {
			const href = node?.properties?.href
			if (typeof href !== 'string') return
			if (/^[a-z][a-z\d+.-]*:/i.test(href)) return
			const hashIndex = href.indexOf('#')
			const target = hashIndex === -1 ? href : href.slice(0, hashIndex)
			const hash = hashIndex === -1 ? '' : href.slice(hashIndex)
			if (!target.endsWith('.org')) return

			const targetSlug = resolveOrgHrefToContentSlug({
				root,
				filePath,
				href: target
			})
			if (!targetSlug) return
			node.properties.href = pageUrl(targetSlug) + hash
		})

		/**
		 * URL of the page at `slug`. With a relative `base`, it is relative to
		 * this page's directory, as pages are written to `<slug>/index.html`.
		 * @param {string} slug
		 */
		function pageUrl(slug) {
			const { base } = site
			if ((base === './' || base === '') && filePath) {
				const depth = getSlugFromContentFilePath(path.relative(root, filePath))
					.split('/')
					.filter(Boolean).length
				return (depth ? '../'.repeat(depth) : './') + slug.slice(1)
			}
			return base.replace(/\/$/, '') + slug
		}
	}
}

/**
 * @param {Object} options
 * @param {string} options.root
 * @param {string} options.filePath
 * @param {string} options.href
 * @returns {string|null}
 */
function resolveOrgHrefToContentSlug({ root, filePath, href }) {
	const decodedHrefPath = decodeURI(href)
	const absoluteTargetPath = decodedHrefPath.startsWith('/')
		? path.resolve(root, `.${decodedHrefPath}`)
		: path.resolve(path.dirname(filePath), decodedHrefPath)

	const relativeTargetPath = path.relative(root, absoluteTargetPath)
	if (
		relativeTargetPath.startsWith('..') ||
		path.isAbsolute(relativeTargetPath)
	) {
		return null
	}

	return getSlugFromContentFilePath(relativeTargetPath)
}

function genId(length = 8) {
	const array = new Uint8Array(length)
	crypto.getRandomValues(array)
	return Array.from(array, (byte) => (byte % 36).toString(36)).join('')
}
