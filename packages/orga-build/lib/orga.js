/**
 * @import {Root as HastTree} from 'hast'
 */
import _orga from '@orgajs/rollup'
import { visitParents } from 'unist-util-visit-parents'

/**
 * @param {Object} options
 * @param {string|string[]} options.containerClass - CSS class name(s) to wrap the rendered content
 */
export function setupOrga({ containerClass }) {
	return _orga({
		rehypePlugins: [[rehypeWrap, { className: containerClass }], image],
		reorgRehypeOptions: {
			linkHref: (link) => {
				console.log({ link })
				if (link.path.protocol === 'file') {
					return link.path.value.replace(/\.org$/, '')
				}
				return link.path.value
			}
		}
	})
}

// --- plugins ---

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

function image() {
	/**
	 * @param {any} tree
	 */
	return function (tree) {
		/** @type {Record<string, string>} */
		const imports = {}
		visitParents(tree, { tagName: 'img' }, (node) => {
			node.type = 'jsx'
			const { src, target } = node.properties
			if (typeof src !== 'string') return
			if (src.startsWith('http')) {
				return
			}
			const name = (imports[src] ??= `asset_${genId()}`)
			node.value = `<img src={${name}} target='${target}'/>`
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

function genId(length = 8) {
	const array = new Uint8Array(length)
	crypto.getRandomValues(array)
	return Array.from(array, (byte) => (byte % 36).toString(36)).join('')
}
