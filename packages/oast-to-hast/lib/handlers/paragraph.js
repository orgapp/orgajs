/**
 * Block-level HTML elements that are not allowed as descendants of <p>.
 * When a paragraph contains any of these, we must avoid wrapping in <p>.
 *
 * @see https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element
 */
const BLOCK_TAGS = new Set([
	'address', 'article', 'aside', 'blockquote', 'details', 'dialog',
	'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure',
	'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
	'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'ol', 'p',
	'pre', 'section', 'summary', 'table', 'ul',
])

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Paragraph} node
 * @returns {import('hast').Element}
 */
export function paragraph(state, node) {
	const properties = state.getAttrHtml(node)
	const children = state.all(node)

	// If any child is a block-level element (e.g. a <figure> from a media link
	// with caption), wrapping in <p> produces invalid HTML and causes hydration
	// errors in React. Unwrap single block children; use <div> for mixed content.
	const hasBlock = children.some(
		(child) => child.type === 'element' && BLOCK_TAGS.has(/** @type {import('hast').Element} */ (child).tagName)
	)

	if (hasBlock) {
		if (children.length === 1) {
			return /** @type {import('hast').Element} */ (children[0])
		}
		return state.patch(node, {
			type: 'element',
			tagName: 'div',
			properties: properties ?? {},
			children,
		})
	}

	return state.patch(node, {
		type: 'element',
		tagName: 'p',
		properties: properties ?? {},
		children,
	})
}
