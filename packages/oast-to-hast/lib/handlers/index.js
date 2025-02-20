import { keyword } from './keyword.js'
import { headline } from './headline.js'
import { paragraph } from './paragraph.js'
import { text } from './text.js'
import { link } from './link.js'
import { block } from './block.js'
import { html } from './html.js'
import { latex } from './latex.js'
import { section } from './section.js'
import { hr } from './hr.js'
import { checkbox, list, item as listItem } from './list.js'
import { footnote, footnoteRef } from './footnote.js'
import {
	table,
	cell as tableCell,
	row as tableRow,
	hr as tableHr,
} from './table.js'
import { document } from './document.js'

/**
 * Default handlers for nodes.
 *
 * @satisfies {import('../state.js').Handlers}
 */
export const handlers = {
	document,
	keyword,
	headline,
	section,
	paragraph,
	text,
	block,
	latex,
	link,
	list,
	'list.item': listItem,
	'list.item.tag': ignore,
	'list.item.bullet': ignore,
	'list.item.checkbox': checkbox,
	'link.path': ignore,
	table,
	'table.row': tableRow,
	'table.cell': tableCell,
	'table.hr': tableHr,
	html,
	jsx: passThrough,
	drawer: ignore,
	priority: ignore,
	planning: ignore,
	footnote,
	'footnote.reference': footnoteRef,
	hr,
}

/** @type {import('../state.js').Handler} */
function ignore() {
	return undefined
}

/** @type {import('../state.js').Handler} */
function passThrough(_, node) {
	return node
}
