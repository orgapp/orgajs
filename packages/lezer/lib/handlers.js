/**
 * @typedef {import('./types.js').Seed} Seed
 * @typedef {import('./types.js').Handler} Handler

 * @typedef {Record<string, Handler>} Handlers
 *   Handle nodes.

 */
import { nodes } from './nodes.js'

/**
 * @type {Handlers}
 */
export const handlers = {
  document: () => {
    return {
      id: nodes.document,
    }
  },
  headline: () => ({ id: nodes.headline }),
  stars: () => nodes.stars,
  todo: () => nodes.keyword,
  'link.path': () => nodes.link,
  opening: () => nodes.marker,
  closing: () => nodes.marker,
  'block.begin': () => nodes.marker,
  'block.end': () => nodes.marker,
  tags: () => nodes.marker,
  keyword: () => nodes.marker,
  text: (state, node) => {
    if (node.type !== 'text') {
      return false
    }
    console.log({ node })
    // if (node.style === 'verbatim') {
    //   return nodes.code
    // }
    if (node.style === 'bold') {
      return nodes.bold
    }
    return false
  },
}
