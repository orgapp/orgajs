/**
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

/**
 * Whether an asset path names a local file. A scheme (`https:`, `data:`) or
 * `//host` means it doesn't; an empty value (`#+image:`) is left to a
 * placeholder's fallback.
 * @param {unknown} src
 * @returns {src is string}
 */
export function isLocalPath(src) {
	return (
		typeof src === 'string' &&
		src !== '' &&
		!/^([a-z][a-z\d+.-]*:|\/\/)/i.test(src)
	)
}
