/**
 * @import {Root as HastTree} from 'hast'
 */
import path from 'node:path'
import _orga from '@orgajs/rollup'
import { visitParents } from 'unist-util-visit-parents'
import { getSlugFromContentFilePath } from './files.js'

/**
 * @param {Object} options
 * @param {string|string[]} options.containerClass - CSS class name(s) to wrap the rendered content
 * @param {string} options.root - Root directory for content files
 * @param {import('unified').PluggableList} [options.rehypePlugins] - Extra rehype plugins appended to defaults
 */
export function setupOrga({ containerClass, root, rehypePlugins = [] }) {
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
				mediaAssets,
				...rehypePlugins
			]
		})
	]
}

// --- plugins ---

function mediaAssets() {
	/**
	 * @param {any} tree
	 */
	return function (tree) {
		/** @type {Record<string, string>} */
		const imports = {}
		visitParents(tree, [{ tagName: 'img' }, { tagName: 'video' }], (node) => {
			node.type = 'jsx'
			const { src, ...rest } = node.properties
			if (typeof src !== 'string') return
			if (src.startsWith('http')) return
			const tagName = node.tagName
			if (!imports[src]) imports[src] = `asset_${genId()}`
			const name = imports[src]
			const attrs = Object.entries(rest)
				.filter(([, v]) => v !== undefined && v !== false)
				.map(([k, v]) =>
					v === true ? k : `${k}={${JSON.stringify(String(v))}}`
				)
				.join(' ')
			node.value = `<${tagName} src={${name}}${attrs ? ` ${attrs}` : ''}/>`
		})

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
