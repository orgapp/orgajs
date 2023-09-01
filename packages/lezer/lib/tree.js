import { NodeProp, NodeType, Tree } from '@lezer/common'
import { nodeSet } from './nodes.js'

/**
 * @param {number} type
 * @param {number} value
 * @param {number} [parentHash=0]
 */
function hash(type, value, parentHash = 0) {
  return (parentHash + (parentHash << 8) + type + (value << 4)) | 0
}

/**
 * @param {number} type
 * @param {number} value
 * @param {number} from
 * @param {number} parentHash
 * @param {number} end
 */
export function treeBuilder(type, value, from, parentHash, end) {
  /** @type {Tree[]} */
  const children = []
  /** @type {number[]} */
  const positions = []

  const _hash = hash(type, value, parentHash)

  /** @type {[NodeProp<any>, any][]} */
  const props = [[NodeProp.contextHash, _hash]]

  /**
   * @param {Tree} child
   * @param {number} pos
   */
  function addChild(child, pos) {
    if (child.prop(NodeProp.contextHash) != _hash)
      child = new Tree(
        child.type,
        child.children,
        child.positions,
        child.length,
        props
      )
    children.push(child)
    positions.push(pos)
  }

  /**
   * @param {Tree[]} children
   * @param {number[]} positions
   */
  function addChildren(children, positions) {
    for (let i = 0; i < children.length; i++)
      addChild(children[i], positions[i])
  }

  /**
   * @param {Tree} tree
   * @param {number} [offset=0]
   */
  function takeChildren(tree, offset = 0) {
    // addChildren(tree.children, tree.positions)
    const cursor = tree.cursor()
    if (!cursor.firstChild()) return
    do {
      const child = cursor.tree
      if (!child) continue
      // TODO: is the position correct?
      addChild(child, cursor.from + offset)
    } while (cursor.nextSibling())
  }

  /**
   * @returns {Tree}
   */
  function build() {
    let last = children.length - 1
    if (last >= 0)
      end = Math.max(end, positions[last] + children[last].length + from)

    const tree = new Tree(
      nodeSet.types[type],
      children,
      positions,
      end - from
    ).balance({
      makeTree: (children, positions, length) =>
        new Tree(NodeType.none, children, positions, length, props),
    })

    // console.log(tree)

    return tree
  }

  return {
    addChild,
    addChildren,
    takeChildren,
    build,
    hash: _hash,
  }
}
