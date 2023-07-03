import { Schema } from 'prosemirror-model'

export const defaultSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    section: {
      content: 'headline block*',
      group: 'block',
      toDOM() {
        return ['section', 0]
      },
    },
    headline: {
      attrs: { level: { default: 1 } },
      content: '(text|link)*',
      group: 'block',
      parseDOM: [
        { tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
        { tag: 'h5', attrs: { level: 5 } },
        { tag: 'h6', attrs: { level: 6 } },
      ],
      toDOM(node) {
        return ['h' + node.attrs.level, 0]
      },
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0]
      },
    },
    text: {
      group: 'inline',
    },
    link: {
      content: 'text*',
      group: 'inline',
      inline: true,
      attrs: {
        href: {},
        title: { default: null },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom) {
            return {
              href: dom.getAttribute('href'),
              title: dom.getAttribute('title'),
            }
          },
        },
      ],
      toDOM(node) {
        return ['a', node.attrs, 0]
      },
    },
    code: {
      content: 'inline*',
      group: 'block',
      attrs: { params: {} },
      toDOM() {
        return ['pre', ['code', 0]]
      },
    },
    newline: {
      inline: true,
      group: 'inline',
      selectable: false,
      toDOM() {
        return ['br']
      },
    },
  },
  marks: {
    raw: {
      attrs: {
        type: {},
      },
      toDOM(node) {
        return [
          'code',
          {
            style: `border:1px solid red;before:${node.attrs.type}`,
            'data-node-type': node.attrs.type,
          },
        ]
      },
    },
  },
})
