/**
 * @typedef {import('orga').Document} OrgTree
 * @typedef {import('@lezer/common').Tree} LezerTree
 * @typedef {import('@lezer/common').NodeSet} NodeSet
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
import { NodeProp, Tree } from '@lezer/common'
import { handlers } from './handlers.js'

/**
 * @param {import('vfile').VFile | null} file
 * @param {NodeSet} nodeSet
 * @returns {ParseState}
 */
function createParseState(file, nodeSet) {
	/** @type {ParseState} */
	const state = {
		file,
		ignore: ['newline', 'emptyLine'],
		nodeSet: nodeSet,
		handlers,
		one(node, parent, base = 0) {
			return one(this, node, parent, base)
		},
		all(parent, base) {
			return all(this, parent, base)
		}
	}
	return state
}

/**
 * @param {OrgTree} tree
 * @param {NodeSet} nodeSet
 * @param {import('vfile').VFile | null} [file=null]
 * @returns {import('@lezer/common').Tree}
 */
export function toLezer(tree, nodeSet, file = null) {
	// TODO: inject gaps
	const state = createParseState(file, nodeSet)
	const result = state.one(tree)
	if (!result) {
		throw new Error('no result')
	}
	const t = result.nodes[0]
	const props = tree.properties
	return t
}

/** @type {import('./types.js').Handler} */
function defaultUnknownHandler() {
	// console.log('unknown node', n.type, n)
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

	let [id, skip, props] =
		typeof seed === 'number' ? [seed, false] : [seed.id, seed.skip, seed.props]

	const [loc, len] = getRange(node)
	const pos = loc - base

	/** @type {Tree[]} */
	let nodes = []
	/** @type {number[]} */
	let positions = []
	if (!skip) {
		const result = state.all(node, loc)
		nodes = result.nodes
		positions = result.positions
	}

	if (node.data?.hash !== undefined) {
		if (!props) {
			props = []
		}
		props.push([NodeProp.contextHash, node.data.hash])
	}

	const tree = new Tree(state.nodeSet.types[id], nodes, positions, len, props)
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
				positions: []
			}
			_nodes.push(...nodes)
			_positions.push(...positions)
		}
	}
	return {
		nodes: _nodes,
		positions: _positions
	}
}
