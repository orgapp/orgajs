/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Link} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function link(state, node) {
  state.ignore('opening', 'closing')
  const n = state.schema.node(
    'link',
    {
      href: node.path.value,
    },
    state.all(node)
  )
  state.unignore('opening', 'closing')
  return n
}
