import { NodeProp, NodeSet, NodeType } from '@lezer/common'
import { styleTags, tags as t } from '@lezer/highlight'

let i = 0
export const nodes = Object.freeze({
  none: i++,
  document: i++,
  headline: i++,
  paragraph: i++,
  keyword: i++,
  block: i++,
  // inline
  stars: i++,
  link: i++,
  marker: i++,
  bold: i++,
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

const orgHighlighting = styleTags({
  headline: t.heading,
  stars: t.comment,
  keyword: t.keyword,
  link: t.link,
  marker: t.comment,
  bold: t.strong,
})

export const nodeSet = new NodeSet(nodeTypes).extend(orgHighlighting)
