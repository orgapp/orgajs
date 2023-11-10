/**
 * @typedef {{from: number, to?: number, insert?: string}[]} ChangeSpec
 */
import { describe, it } from 'node:test'
import { Tree, TreeFragment } from '@lezer/common'
import assert from 'node:assert'
import { parser } from '../lib/index.js'
import { compareTree } from './compare-tree.js'

const doc = `* Header
This is a /paragraph/.
Still the same =paragraph=.

#+begin_src js
console.log('hello')
#+end_src

here is a link: [[https://example.com][link text]]
`
const docLength = doc.length

class State {
  constructor(doc, tree, fragments) {
    this.doc = doc
    this.tree = tree
    this.fragments = fragments
  }

  static start(doc) {
    let tree = parser.parse(doc)
    return new State(doc, tree, TreeFragment.addTree(tree))
  }

  /**
   * @param {ChangeSpec[]} changes
   * @param {boolean} reparse
   */
  update(changes, reparse = true) {
    let changed = [],
      doc = this.doc,
      off = 0
    for (let { from, to = from, insert = '' } of changes) {
      doc = doc.slice(0, from) + insert + doc.slice(to)
      changed.push({
        fromA: from - off,
        toA: to - off,
        fromB: from,
        toB: from + insert.length,
      })
      off += insert.length - (to - from)
    }
    let fragments = TreeFragment.applyChanges(this.fragments, changed, 2)
    if (!reparse) return new State(doc, Tree.empty, fragments)
    // return this
    let tree = parser.parse(doc, fragments)
    return new State(doc, tree, TreeFragment.addTree(tree, fragments))
  }
}

// const state1 = State.start(doc)

/**
 * @param {ChangeSpec} change
 * @param {boolean} [verbose=false]
 * @param {number} reuse
 */
function testChange(change, verbose = false, reuse = 10) {
  const state1 = State.start(doc)
  let state = state1.update(change)
  const updatedDoc = state.doc
  verbose && console.log('updatedDoc', updatedDoc)
  compareTree(state.tree, parser.parse(updatedDoc))

  if (reuse) {
    const diff = overlap(state.tree, state1.tree)
    assert.ok(diff > reuse, `diff: ${diff}`)
  }
}

/**
 * @param {Tree} a
 * @param {Tree} b
 */
function overlap(a, b) {
  let inA = new Set(),
    shared = 0,
    sharingTo = 0
  for (let cur = a.cursor(); cur.next(); ) if (cur.tree) inA.add(cur.tree)
  for (let cur = b.cursor(); cur.next(); )
    if (
      cur.tree &&
      inA.has(cur.tree) &&
      cur.type.is('Block') &&
      cur.from >= sharingTo
    ) {
      shared += cur.to - cur.from
      sharingTo = cur.to
    }
  return Math.round((shared * 100) / b.length)
}

describe('incremential parsing', () => {
  // it.runOnly(true)
  it('can insert in the middle', () => {
    testChange([{ from: 2, to: 2, insert: 'bears' }])
  })
  it('can insert at the begining', () => {
    testChange([{ from: 0, to: 0, insert: 'bears' }])
  })
  it('can handle deletion', () => {
    testChange([{ from: 0, to: 5 }])
  })
  it('can appending at the end', () => {
    const size = doc.length
    testChange([{ from: size, to: size, insert: '* another heading' }])
  })
  it('can replace content', () => {
    testChange([{ from: 2, to: 8, insert: 'bears' }])
  })
  it('reuses nodes from the previous parse', () => {
    const state1 = State.start(doc)
    let state = state1.update([{ from: 2, to: 8, insert: 'bears' }])
    const diff = overlap(state1.tree, state.tree)
    assert.ok(diff > 90, `diff: ${diff}`)
    console.log('hello test')
  })
  it('can handle deleting a star', () => testChange([{ from: 0, to: 1 }]))
  // it('can reuse content for a change in a block context', () => {})
  // it('can handle adding to a quoted block', () => {})
  // it('can handle a change in a post-linkref paragraph', () => {})
  // it('can handle a change in a paragraph-adjacent linkrefs', () => {})

  it('can handle insertion at the eof', () =>
    testChange([{ from: docLength, to: docLength, insert: '* h' }]))
})
