import { text } from './text.js'
import { paragraph } from './paragraph.js'
import { headline } from './headline.js'
import { link } from './link.js'
import { section } from './section.js'
import { block } from './block.js'
import { newline } from './newline.js'

/* @type {import('../index.js').Handlers} */
export const handlers = {
  section,
  text,
  paragraph,
  headline,
  link,
  block,
  newline,
}

export const ignore = ['link.path', 'stars', 'emptyLine']
