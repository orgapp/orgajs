import { Tree } from '@lezer/common'

/**
 * @typedef {import('@lezer/common').Tree} Tree
 */

/**
 * @param {Tree} a
 * @param {Tree} b
 */
export function compareTree(a, b) {
  let curA = a.cursor(),
    curB = b.cursor()
  for (;;) {
    let mismatch = null,
      next = false
    if (curA.type != curB.type)
      mismatch = `Node type mismatch (${curA.name} vs ${curB.name})`
    else if (curA.from != curB.from)
      mismatch = `Start pos mismatch for ${curA.name}: ${curA.from} vs ${curB.from}`
    else if (curA.to != curB.to)
      mismatch = `End pos mismatch for ${curA.name}: ${curA.to} vs ${curB.to}`
    else if ((next = curA.next()) != curB.next())
      mismatch = `Tree size mismatch`
    if (mismatch) {
      const lines = [mismatch, 'a-:>', ...print(a), 'b-:>', ...print(b)]
      throw new Error(lines.join('\n'))
    }

    if (!next) break
  }
}

/**
 * @param {import('@lezer/common').TreeCursor | Tree} tree
 * @param {string} [prefix]
 */
export function print(tree, prefix = '') {
  const cur = tree instanceof Tree ? tree.cursor() : tree
  const lines = [`${prefix}${cur.name} (${cur.from}-${cur.to})`]
  if (cur.firstChild()) {
    do {
      lines.push(...print(cur, ' '.repeat(prefix.length) + '└╴'))
    } while (cur.nextSibling())
    cur.parent()
  }
  return lines
}
