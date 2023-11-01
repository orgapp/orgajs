/**
 * @typedef {import('./types.js').Seed} Seed
 * @typedef {import('./types.js').Handler} Handler

 * @typedef {Record<string, Handler>} Handlers
 *   Handle nodes.

 */
import { nodes } from './nodes.js'

// class NodeProp extends _NodeProp {
//   static path = new _NodeProp({ perNode: true })
// }

const headlines = [
  nodes.headline1,
  nodes.headline2,
  nodes.headline3,
  nodes.headline4,
  nodes.headline5,
  nodes.headline6,
]

/**
 * @type {Handlers}
 */
export const handlers = {
  document: () => {
    return {
      id: nodes.document,
    }
  },
  headline: (s, node) => {
    if (node.type === 'headline') {
      return {
        id: headlines[node.level - 1] || nodes.headline6,
      }
    }
    return false
  },
  stars: () => nodes.stars,
  todo: (_s, node) => {
    if (node.type !== 'todo') {
      return false
    }

    if (node.actionable) {
      return nodes.todo
    }
    return nodes.done
  },
  'link.path': () => nodes.url,
  // 'link.description': () => nodes.linkDescription,
  link: () => nodes.link,
  opening: () => nodes.mark,
  closing: () => nodes.mark,
  block: () => nodes.block,
  html: () => nodes.html,
  jsx: () => nodes.jsx,
  'block.begin': () => nodes.blockBegin,
  'block.end': () => nodes.blockEnd,
  tags: () => nodes.marker,
  keyword: () => nodes.keyword,
  paragraph: () => nodes.paragraph,
  list: () => nodes.list,
  'list.item.bullet': () => nodes.marker,
  text: (_, node) => {
    if (node.type !== 'text') {
      return false
    }
    switch (node.style) {
      case 'bold':
        return nodes.bold
      case 'italic':
        return nodes.italic
      case 'strikeThrough':
        return nodes.strikeThrough
      case 'code':
        return nodes.code
      case 'verbatim':
        return nodes.code
      case 'underline':
        return nodes.underline
    }
    return false
  },
}
