/**
 * @import {Nodes} from 'hast'
 */

export function rehypeWrap({ className = [] }) {
	return (tree) => {
		/** @type {Array<Nodes>} */
		return {
			...tree,
			children: [
				{
					type: 'element',
					tagName: 'div',
					properties: {
						className
					},
					children: tree.children
				}
			]
		}
	}
}
