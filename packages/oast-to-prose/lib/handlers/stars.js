/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Stars} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function stars(state, node) {
  return state.schema.node('stars', {
    level: node.level,
  })
}
