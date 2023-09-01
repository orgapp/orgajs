import { text } from './text.js'
import { paragraph } from './paragraph.js'
import { headline } from './headline.js'
import { link } from './link.js'
import { section } from './section.js'
import { block } from './block.js'
import { newline } from './newline.js'
import { todo } from './todo.js'
import { stars } from './stars.js'
import { tags } from './tags.js'

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
  tags,
}

export const ignore = ['link.path', 'emptyLine']
