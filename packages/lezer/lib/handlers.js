/**
 * @typedef {import('./types.js').Seed} Seed
 * @typedef {import('./types.js').Handler} Handler

 * @typedef {Record<string, Handler>} Handlers
 *   Handle nodes.

 */
import { NodeProp } from '@lezer/common'
import { nodes } from './nodes.js'

// class NodeProp extends _NodeProp {
//   static path = new _NodeProp({ perNode: true })
// }

/** @type {NodeProp<{level: number}>} */
export const headlineProp = new NodeProp({ perNode: true })

export const documentProp = new NodeProp({
	perNode: true
	// deserialize: (str) => {
	// 	console.log('deserialize', str)
	// 	return str
	// }
})

/**
 * @type {Handlers}
 */
export const handlers = {
	document: (s, doc) => {
		if (doc.type !== 'document') {
			return false
		}
		return {
			id: nodes.document,
			props: [[documentProp, doc.properties]]
		}
	},
	headline: (s, node) => {
		if (node.type === 'headline') {
			return {
				id: nodes.headline,
				props: [[headlineProp, { level: node.level }]]
			}
		}
		return false
	},
	stars: () => nodes.stars,
	todo: (_s, node) => {
		if (node.type !== 'todo') {
			return false
		}

		return nodes.todo
	},
	'link.path': () => nodes.url,
	// 'link.description': () => nodes.linkDescription,
	link: () => nodes.link,
	opening: () => nodes.mark,
	closing: () => nodes.mark,
	block: () => nodes.block,
	html: () => nodes.html,
	jsx: () => nodes.jsx,
	'block.begin': () => nodes.blockBegin,
	'block.end': () => nodes.blockEnd,
	tags: () => nodes.marker,
	keyword: () => nodes.keyword,
	paragraph: () => nodes.paragraph,
	list: () => nodes.list,
	'list.item.bullet': () => nodes.marker,
	text: (_, node) => {
		if (node.type !== 'text') {
			return false
		}
		switch (node.style) {
			case 'bold':
				return nodes.bold
			case 'italic':
				return nodes.italic
			case 'strikeThrough':
				return nodes.strikeThrough
			case 'code':
				return nodes.code
			case 'verbatim':
				return nodes.code
			case 'underline':
				return nodes.underline
		}
		return false
	}
}
