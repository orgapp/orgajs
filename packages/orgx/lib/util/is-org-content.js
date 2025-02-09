/**
 * Check if a node is an org content node.
 * @param {import('react').ReactNode} node
 * @returns {boolean}
 */
export function isOrgContent(node) {
	return (
		!!node &&
		typeof node === 'object' &&
		'type' in node &&
		typeof node.type === 'function' &&
		node.type.name === 'OrgContent'
	)
}
