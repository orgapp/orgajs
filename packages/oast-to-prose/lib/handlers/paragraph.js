/**
 * @typedef {import('prosemirror-model').Node} ProseNode
 */

/**
 * @param {import('../state.js').State} state
 * @param {import('orga').Paragraph} node
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 */
export function paragraph(state, node) {
  state.inParagraph = true
  const n = state.schema.node('paragraph', null, state.all(node))
  state.inParagraph = false
  return n
}
