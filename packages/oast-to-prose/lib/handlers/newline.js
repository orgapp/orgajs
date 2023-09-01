/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function newline(state) {
  return state.schema.node('newline')
}
