import { NodeProp, NodeSet, NodeType } from '@lezer/common'
import { styleTags, tags as t, Tag } from '@lezer/highlight'

let i = 0
export const nodes = Object.freeze({
  none: i++,
  // block
  document: i++,
  headline: i++,
  paragraph: i++,
  keyword: i++,
  block: i++,
  list: i++,
  // inline
  stars: i++,
  link: i++,
  marker: i++,
  bold: i++,
  italic: i++,
  code: i++,
  strikeThrough: i++,
  underline: i++,
})

/** @type {NodeType[]} */
export const nodeTypes = Object.entries(nodes).map(([name, id]) =>
  NodeType.define({
    id,
    name,
    props: id >= nodes.stars ? [] : [[NodeProp.group, ['Block']]],
    top: name === 'document',
  })
)

// extra tags
const underline = Tag.define(t.content)

const orgHighlighting = styleTags({
  'headline/...': t.heading,
  keyword: t.keyword,
  link: t.link,
  'marker stars': t.processingInstruction,
  italic: t.emphasis,
  bold: t.strong,
  code: t.monospace,
  strikeThrough: t.strikethrough,
  paragraph: t.content,
  list: t.list,
  underline: underline,
})

export const tags = {
  ...t,
  underline,
}

export const nodeSet = new NodeSet(nodeTypes).extend(orgHighlighting)
