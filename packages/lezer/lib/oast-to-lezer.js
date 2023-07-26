/**
 * @typedef {import('orga').Document} OrgTree
 * @typedef {import('@lezer/common').Tree} LezerTree
 * @typedef {import('orga').Document} OastRoot
 * @typedef {import('orga').Content} OastContent
 * @typedef {import('orga').Parent} OastParent

 * @callback Mapping
 *   Transform an oast node to prose node.
 * @param {OastNodes} node
 * @param {number} id
 * @param {Array<LezerTree> | undefined} [children]
 * @returns {LezerTree | null | undefined}

 * @typedef {import('./types.js').State} ParseState
 */
import { Tree } from '@lezer/common'
import { handlers } from './handlers.js'
import { nodeSet } from './nodes.js'

/**
 * @param {import('vfile').VFile} file
 * @returns {ParseState}
 */
function createParseState() {
  /** @type {ParseState} */
  const state = {
    ignore: ['paragraph', 'newline', 'emptyLine', 'section'],
    handlers,
    one(node, parent, base = 0) {
      return one(this, node, parent, base)
    },
    all(parent, base) {
      return all(this, parent, base)
    },
  }
  return state
}

/**
 * @param {OrgTree} tree
 * @param {import('vfile').VFile} file
 * @returns {import('@lezer/common').Tree}
 */
export function toLezer(tree, file) {
  const state = createParseState(file)
  const result = state.one(tree)
  if (!result) {
    throw new Error('no result')
  }
  const t = result.nodes[0]
  return t
}

/** @type {import('./types.js').Handler} */
const defaultUnknownHandler = (_, node) => {
  console.log('unknown:', node.type)
  return true
}

/**
 * @param {import('./types.js').OastNode} node
 * @returns {[number, number]}
 */
function getRange(node) {
  const start = node.position?.start.offset || 0
  const end = node.position?.end.offset || 0
  return [start, end - start]
}

/**
 * @param {ParseState} state
 * @param {import('./types.js').OastNode} node
 * @param {OastParent | undefined} [parent]
 * @param {number} [base=0]
 * @returns {{nodes: LezerTree[], positions: number[]} | null | undefined}}
 */
function one(state, node, parent, base = 0) {
  if (state.ignore.includes(node.type)) {
    return state.all(node, base)
  }

  const handler = state.handlers[node.type] || defaultUnknownHandler
  const seed = handler(state, node, parent)

  if (typeof seed === 'boolean') {
    if (seed) {
      return state.all(node, base)
    }
    return null
  }

  const [id, skip] =
    typeof seed === 'number' ? [seed, false] : [seed.id, seed.skip]

  const [loc, len] = getRange(node)
  const pos = loc - base
  base = loc
  const { nodes, positions } = !skip
    ? state.all(node, base)
    : {
        nodes: [],
        positions: [],
      }

  const tree = new Tree(nodeSet.types[id], nodes, positions, len)
  const result = { nodes: [tree], positions: [pos] }
  return result
}

/**
 * @param {ParseState} state
 * @param {import('./types.js').OastNode} parent
 * @param {number} base
 * @returns {{nodes: LezerTree[], positions: number[]}}}
 */
function all(state, parent, base) {
  /** @type {Array<LezerTree>} */
  const _nodes = []
  /** @type {Array<number>} */
  const _positions = []

  if ('children' in parent) {
    let index = -1
    while (++index < parent.children.length) {
      const node = parent.children[index]
      const { nodes, positions } = state.one(node, parent, base) || {
        nodes: [],
        positions: [],
      }
      _nodes.push(...nodes)
      _positions.push(...positions)
    }
  }
  return {
    nodes: _nodes,
    positions: _positions,
  }
}
