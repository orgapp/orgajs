import { NodeSet, NodeType } from '@lezer/common'
import { styleTags, tags as t } from '@lezer/highlight'

let _id = 0

/** @type {NodeType[]} */
export const nodeTypes = []

/**
 * @param {string} [name]
 */
function n(name) {
  const id = _id++
  const nodeType = name
    ? NodeType.define({
        id,
        name,
        props: [],
        top: name === 'document',
      })
    : NodeType.none
  nodeTypes.push(nodeType)
  return id
}

export const nodes = Object.freeze({
  none: n(),
  document: n('document'),
  headline: n('headline'),
  stars: n('stars'),
  keyword: n('keyword'),
  link: n('link'),
  marker: n('marker'),
  bold: n('bold'),
})

const orgHighlighting = styleTags({
  headline: t.heading,
  stars: t.comment,
  keyword: t.keyword,
  link: t.link,
  marker: t.comment,
  bold: t.strong,
})

export const nodeSet = new NodeSet(nodeTypes).extend(orgHighlighting)
