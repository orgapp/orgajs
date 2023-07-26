/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Tags} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function tags(state, node) {
  return node.tags.map((tag) =>
    state.schema.node('tag', { tag }, state.schema.text(tag))
  )
}
