import { NodeProp, NodeSet, NodeType } from '@lezer/common'
import { styleTags, Tag, tags as t } from '@lezer/highlight'

let i = 0
export const nodes = Object.freeze({
	none: i++,
	// block
	document: i++,
	headline: i++,
	section: i++,
	paragraph: i++,
	keyword: i++,
	block: i++,
	list: i++,
	html: i++,
	jsx: i++,
	// inline
	stars: i++,
	todo: i++,
	done: i++,
	link: i++,
	marker: i++,
	bold: i++,
	italic: i++,
	code: i++,
	strikeThrough: i++,
	underline: i++,
	url: i++,
	blockBegin: i++,
	blockEnd: i++,
	// smaller
	mark: i++
})

/**
 * @type {NodeProp<{level: number}>}
 */
export const headlineProp = new NodeProp()

/** @type {NodeType[]} */
export const nodeTypes = Object.entries(nodes).map(([name, id]) =>
	NodeType.define({
		id,
		name,
		props: id >= nodes.stars ? [] : [[NodeProp.group, ['Block']]],
		top: name === 'document'
	})
)

// extra tags
const underline = Tag.define(t.content)

const orgHighlighting = styleTags({
	'headline/...': t.heading,
	keyword: t.attributeName,
	link: t.link,
	'stars mark blockBegin blockEnd': t.processingInstruction,
	italic: t.emphasis,
	bold: t.strong,
	strikeThrough: t.strikethrough,
	paragraph: t.content,
	list: t.list,
	underline: underline,
	'html jsx code block': t.monospace
})

export const tags = {
	...t,
	underline
}

export const nodeSet = new NodeSet(nodeTypes).extend(orgHighlighting)
