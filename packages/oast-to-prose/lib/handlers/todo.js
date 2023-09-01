/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Todo} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function todo(state, node) {
  return state.schema.node('todo', {
    keyword: node.keyword,
    actionable: node.actionable,
  })
}
