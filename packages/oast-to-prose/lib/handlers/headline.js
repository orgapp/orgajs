/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Headline} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function headline(state, node) {
  state.ignore('newline')
  const n = state.schema.node(
    'headline',
    { level: node.level },
    state.all(node)
  )
  state.unignore('newline')
  return n
}
