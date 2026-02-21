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
 */
export function setupOrga({ containerClass, root }) {
	return _orga({
		rehypePlugins: [
			[rehypeWrap, { className: containerClass }],
			[rewriteOrgFileLinks, { root }],
			mediaAssets
		],
		reorgRehypeOptions: {
			linkHref: (link) => link.path.value
		}
	})
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
			const name = (imports[src] ??= `asset_${genId()}`)
			const attrs = Object.entries(rest)
				.filter(([, v]) => v !== undefined && v !== false)
				.map(([k, v]) => (v === true ? k : `${k}='${v}'`))
				.join(' ')
			node.value = `<${tagName} src={${name}}${attrs ? ` ${attrs}` : ''}/>`
		})

		for (const [src, name] of Object.entries(imports)) {
			tree.children.unshift({
				type: 'jsx',
				value: `import ${name} from '${src}'`,
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
					// @ts-ignore
					children: tree.children
				}
			]
		}
	}
}

/**
 * @param {Object} options
 * @param {string} options.root
 */
function rewriteOrgFileLinks({ root }) {
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
			if (!href.endsWith('.org')) return

			const targetSlug = resolveOrgHrefToContentSlug({
				root,
				filePath,
				href
			})
			if (!targetSlug) return
			node.properties.href = targetSlug
		})
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
	if (relativeTargetPath.startsWith('..') || path.isAbsolute(relativeTargetPath)) {
		return null
	}

	return getSlugFromContentFilePath(relativeTargetPath)
}

function genId(length = 8) {
	const array = new Uint8Array(length)
	crypto.getRandomValues(array)
	return Array.from(array, (byte) => (byte % 36).toString(36)).join('')
}
