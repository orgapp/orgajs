import { block } from './block.js'
import { headline } from './headline.js'
import { link } from './link.js'
import { newline } from './newline.js'
import { paragraph } from './paragraph.js'
import { section } from './section.js'
import { stars } from './stars.js'
import { tags } from './tags.js'
import { text } from './text.js'
import { todo } from './todo.js'

/* @type {import('../index.js').Handlers} */
export const handlers = {
	section,
	text,
	paragraph,
	headline,
	link,
	block,
	newline,
	todo,
	stars,
	tags
}

export const ignore = ['link.path', 'emptyLine']
