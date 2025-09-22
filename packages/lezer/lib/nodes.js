import { NodeProp, NodeSet, NodeType } from '@lezer/common'
import { styleTags, Tag, tags as t } from '@lezer/highlight'

let i = 0
export const nodes = Object.freeze({
  none: i++,
  // block
  document: i++,
  headline1: i++,
  headline2: i++,
  headline3: i++,
  headline4: i++,
  headline5: i++,
  headline6: i++,
	section1: i++,
	section2: i++,
	section3: i++,
	section4: i++,
	section5: i++,
	section6: i++,
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
  mark: i++,
})

/** @type {NodeType[]} */
export const nodeTypes = Object.entries(nodes).map(([name, id]) =>
  NodeType.define({
    id,
    name,
    props: id >= nodes.stars ? [] : [[NodeProp.group, ['Block']]],
    top: name === 'document',
  }),
)

// extra tags
const underline = Tag.define(t.content)

const orgHighlighting = styleTags({
  'headline1/...': t.heading1,
  'headline2/...': t.heading2,
  'headline3/...': t.heading3,
  'headline4/...': t.heading4,
  'headline5/...': t.heading5,
  'headline6/...': t.heading6,
  keyword: t.attributeName,
  link: t.link,
  'stars mark blockBegin blockEnd': t.processingInstruction,
  italic: t.emphasis,
  bold: t.strong,
  strikeThrough: t.strikethrough,
  paragraph: t.content,
  list: t.list,
  underline: underline,
  'html jsx code block': t.monospace,
})

export const tags = {
  ...t,
  underline,
}

export const nodeSet = new NodeSet(nodeTypes).extend(orgHighlighting)
