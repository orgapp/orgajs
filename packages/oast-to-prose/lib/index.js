/**
 * @typedef {import('orga').Document} OastRoot
 * @typedef {import('orga').Content} OastContent
 * @typedef {import('orga').Parent} OastParent
 * @typedef {import('prosemirror-model').Node} ProseNode
 * @typedef {OastRoot | OastContent} OastNodes
 *
 * @callback Handler
 *   Handle a node.
 * @param {import('./state.js').State} state
 *   Info passed around.
 * @param {any} node
 *   oast node to handle.
 * @param {OastParent | null | undefined} parent
 *   Parent of `node`.
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 *   prose node.
 *
 * @typedef {Record<string, Handler>} Handlers
 *   Handle nodes.
 *
 * @typedef Options
 * @property {import('prosemirror-model').Schema} schema
 */

import { createParseState } from './state.js'
import { defaultSchema } from './schema.js'

export const schema = defaultSchema

/**
 * @param {OastRoot} tree
 * @param {Options | undefined | null} [options]
 * @returns {ProseNode}
 */
export function toProse(tree, options) {
  const schema = (options || {}).schema || defaultSchema
  const state = createParseState({ schema })
  const node = state.one(tree, null)
  return schema.node('doc', null, node || undefined)
}
