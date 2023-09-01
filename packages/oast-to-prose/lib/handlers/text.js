/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Text} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function text(state, node) {
  return state.schema.text(node.value)
}
