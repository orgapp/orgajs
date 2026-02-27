import { parseHtml } from './html.js'

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Block} node
 * @returns {import('hast').Element|undefined}
 */
export function block(state, node) {
	const name = node.name.toLowerCase()

	/**
	 * Preserve inline markup for block types whose content is parsed into
	 * block children by orga. Fallback to the raw value for externally-provided
	 * trees that omit `children`.
	 */
	const parsedChildren = state.all(node)

	if (name === 'src') {
		const lang = node.params?.[0]
			? `language-${node.params[0]}`
			: 'language-undefined'
		return state.patch(node, {
			type: 'element',
			tagName: 'pre',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: { className: [lang] },
					children: [
						{
							type: 'text',
							value: node.value
						}
					]
				}
			]
		})
	}

	if (name === 'quote') {
		return state.patch(node, {
			type: 'element',
			tagName: 'blockquote',
			properties: {},
			children:
				parsedChildren.length > 0
					? parsedChildren
					: [
							{
								type: 'text',
								value: node.value
							}
						]
		})
	}

	if (name === 'center') {
		return state.patch(node, {
			type: 'element',
			tagName: 'center',
			properties: {},
			children:
				parsedChildren.length > 0
					? parsedChildren
					: [
							{
								type: 'text',
								value: node.value
							}
						]
		})
	}

	if (name === 'export') {
		if (node.params[0].toLowerCase() === 'html') {
			return state.patch(node, parseHtml(node.value))
		}

		return {
			// @ts-expect-error: this is a special passthrough
			type: (node.params[0] || 'raw').toLowerCase(),
			value: node.value
		}
	}

	if (name === 'comment') {
		return undefined
	}

	return state.patch(node, {
		type: 'element',
		tagName: 'pre',
		properties: { className: [name] },
		children: [
			{
				type: 'text',
				value: node.value
			}
		]
	})
}
