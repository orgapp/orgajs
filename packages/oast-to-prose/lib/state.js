/**
 * @typedef {import('orga').Document} OastRoot
 * @typedef {import('orga').Content} OastContent
 * @typedef {import('orga').Parent} OastParent
 * @typedef {import('prosemirror-model').Node} ProseNode
 * @typedef {OastRoot | OastContent} OastNodes
 *
 * @typedef HFields
 * @property {import('prosemirror-model').Schema} schema
 *   Schema to use.
 * @property {(node: OastNodes, parent: OastParent | null | undefined) => ProseNode | Array<ProseNode> | null | undefined} one
 *   Transform an oast node to prose node.
 * @property {(node: OastNodes) => Array<ProseNode>} all
 *   Transform the children of an mdast parent to hast.
 * @property {import('./index.js').Handlers} handlers
 *   Applied handlers.
 *
 * @typedef {HFields} State
 *
 * @typedef Options
 * @property {import('prosemirror-model').Schema} schema
 */

import { handlers } from './handlers/index.js'

/**
 * @param {Options} options
 * @returns {State}
 */
export function createParseState(options) {
  /** @type {State} */
  const state = {
    handlers: { ...handlers },
    schema: options.schema,
    one(node, parent) {
      const handler = this.handlers[node.type]
      if (handler) {
        return handler(this, node, parent)
      }
      return defaultUnknownHandler(this, node)
    },
    all(parent) {
      /** @type {Array<ProseNode>} */
      const values = []

      if ('children' in parent) {
        const nodes = parent.children
        let index = -1
        while (++index < nodes.length) {
          const node = this.one(nodes[index], parent)
          if (node) {
            if (Array.isArray(node)) {
              values.push(...node)
            } else {
              values.push(node)
            }
          }
        }
      }
      return values
    },
  }

  return state
}

/**
 * Transform an unknown node.
 *
 * @param {State} state
 *   Info passed around.
 * @param {OastNodes} node
 *   Unknown aast node.
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 *   Resulting pose node.
 */
function defaultUnknownHandler(state, node) {
  if ('value' in node) {
    return state.schema.text(node.value)
  }
  return state.all(node)
}
