import { block } from './block.js'
import { document } from './document.js'
import { footnote, footnoteRef } from './footnote.js'
import { headline } from './headline.js'
import { hr } from './hr.js'
import { html } from './html.js'
import { keyword } from './keyword.js'
import { latex } from './latex.js'
import { link } from './link.js'
import { checkbox, list, item as listItem } from './list.js'
import { newline } from './newline.js'
import { paragraph } from './paragraph.js'
import { section } from './section.js'
import {
	table,
	cell as tableCell,
	hr as tableHr,
	row as tableRow
} from './table.js'
import { text } from './text.js'

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
	newline
}

/** @type {import('../state.js').Handler} */
function ignore() {
	return undefined
}

/** @type {import('../state.js').Handler} */
function passThrough(_, node) {
	return node
}
