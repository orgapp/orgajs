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
  block: () => nodes.block,
  'block.begin': () => nodes.marker,
  'block.end': () => nodes.marker,
  tags: () => nodes.marker,
  keyword: () => nodes.marker,
  paragraph: () => nodes.paragraph,
  text: (_, node) => {
    if (node.type !== 'text') {
      return false
    }
    if (node.style === 'bold') {
      return nodes.bold
    }
    return false
  },
}
