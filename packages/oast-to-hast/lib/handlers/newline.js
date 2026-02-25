/**
 * @param {import('../state.js').State} _state
 * @param {import('orga').Newline} _node
 * @param {import('orga').Parent | undefined} parent
 * @returns {import('hast').Text | undefined}
 */
export function newline(_state, _node, parent) {
	// In Org paragraphs, a single source newline is a soft break. For HTML
	// output, normalize it to a space so text remains readable.
	if (parent?.type === 'paragraph') {
		return { type: 'text', value: ' ' }
	}

	return undefined
}
