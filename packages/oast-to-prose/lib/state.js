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
 * @property {boolean} inParagraph
 *   Whether the current node is in a paragraph.
 * @property {(node: OastNodes, parent: OastParent | null | undefined) => ProseNode | Array<ProseNode> | null | undefined} one
 *   Transform an oast node to prose node.
 * @property {(node: OastNodes) => Array<ProseNode>} all
 *   Transform the children of an mdast parent to hast.
 * @property {import('./index.js').Handlers} handlers
 *   Applied handlers.
 * @property {(...types: string[]) => void} ignore
 * @property {(...types: string[]) => void} unignore
 * @property {string[]} ignored
 *
 * @typedef {HFields} State
 *
 * @typedef Options
 * @property {import('prosemirror-model').Schema} schema
 */

import { handlers, ignore } from './handlers/index.js'

/**
 * @param {import('vfile').VFile} file
 * @param {Options} options
 * @returns {State}
 */
export function createParseState(file, options) {
  /** @type {State} */
  const state = {
    handlers: { ...handlers },
    ignored: [...ignore],
    schema: options.schema,
    inParagraph: false,
    ignore(...types) {
      this.ignored.push(...types)
    },
    unignore(...types) {
      this.ignored = this.ignored.filter((type) => !types.includes(type))
    },
    one(node, parent) {
      if (this.ignored.includes(node.type)) {
        return null
      }
      const handler = this.handlers[node.type]
      if (handler) {
        return handler(this, node, parent)
      }
      return defaultUnknownHandler(this, node, file)
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
 * @param {import('vfile').VFile} file
 * @returns {ProseNode | Array<ProseNode> | null | undefined}
 *   Resulting pose node.
 */
function defaultUnknownHandler(state, node, file) {
  console.log('unknown node', node)
  if ('value' in node) {
    const raw = state.schema.text(
      getRawContent(node, file) || 'cannot find raw',
      [state.schema.mark('raw', { type: node.type })]
    )
    if (!state.inParagraph) {
      return state.schema.node('paragraph', null, [raw])
    }
    return raw
  }
  if ('children' in node) {
    return state.all(node)
  }

  // return state.schema.node('error', null, [
  //   state.schema.text(`unknown node: ${node.type}`),
  // ])
}

/**
 * @param {OastNodes} node
 *   Unknown aast node.
 * @param {import('vfile').VFile} file
 * @returns {string | null}
 */
function getRawContent(node, file) {
  if (node.position) {
    const content = file.value.slice(
      node.position.start.offset,
      node.position.end.offset
    )
    if (typeof content !== 'string') {
      throw new Error('content is not a string')
    }
    return content
  }
  return null
}
