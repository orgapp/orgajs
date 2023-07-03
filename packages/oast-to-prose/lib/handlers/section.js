/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Section} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function section(state, node) {
  const n = state.schema.node('section', null, state.all(node))
  return n
}
