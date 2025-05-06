/**
 * @import {Root} from 'hast'
 */

/**
 * @param {Object} options
 * @param {string[]} options.className
 */
export function rehypeWrap({ className = [] }) {
	/**
	 * Transform.
	 *
	 * @param {Root} tree
	 *   Tree.
	 * @returns {Root}
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
