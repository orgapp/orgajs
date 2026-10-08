/**
 * @import {Headline, Nodes} from 'orga'
 * @import {Config} from './state.js'
 */

import { shouldSkip } from './handlers/section.js'

/**
 * Slug of heading text: lowercased, punctuation dropped, spaces as dashes.
 *
 * @param {string} text
 * @returns {string}
 */
export function slug(text) {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\s_-]/gu, '')
		.replace(/\s+/g, '-')
}

/**
 * Assign every rendered headline a unique id: its section's `CUSTOM_ID` when
 * set, otherwise a slug of its text (`-1`, `-2`… on repeats). Sections skipped
 * by `selectTags`/`excludeTags` are left out, as they are when rendering.
 *
 * @param {Nodes} tree
 * @param {Pick<Config, 'selectTags' | 'excludeTags'>} config
 */
export function headingIds(tree, config) {
	/** @type {Array<{headline: Headline, customId: string | undefined}>} */
	const headlines = []
	collect(tree)

	const used = new Set(headlines.map((h) => h.customId).filter(Boolean))
	/** @type {Map<Headline, string>} */
	const byNode = new Map()
	/** @type {Map<string, string>} first heading with this text slug → its id */
	const byText = new Map()

	for (const { headline, customId } of headlines) {
		const base = slug(text(headline))
		let id = customId
		if (!id && base) {
			id = base
			for (let n = 1; used.has(id); n++) id = `${base}-${n}`
			used.add(id)
		}
		if (!id) continue
		byNode.set(headline, id)
		if (base && !byText.has(base)) byText.set(base, id)
	}

	return { byNode, byText }

	/**
	 * @param {Nodes} node
	 * @param {Nodes} [parent]
	 */
	function collect(node, parent) {
		if (node.type === 'headline') {
			const customId =
				parent?.type === 'section' ? parent.properties.custom_id : undefined
			headlines.push({
				headline: node,
				customId: typeof customId === 'string' ? customId : undefined
			})
			return
		}
		if (!('children' in node)) return
		if (node.type === 'section') {
			const headline = node.children.find((n) => n.type === 'headline')
			if (headline && shouldSkip(config, headline.tags || [])) return
		}
		for (const child of node.children) collect(child, node)
	}
}

const skip = new Set(['stars', 'todo', 'priority', 'tags'])

/**
 * @param {Nodes} node
 * @returns {string}
 */
function text(node) {
	if (skip.has(node.type)) return ''
	if ('children' in node) return node.children.map(text).join('')
	if (node.type === 'text') return node.value
	return ''
}
