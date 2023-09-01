/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Block} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function block(state, node) {
  // TODO: handle more block types
  state.ignore('block.begin', 'block.end')
  const n = state.schema.node('code', null, state.all(node))
  state.unignore('block.begin', 'block.end')
  return n
}
