import tokenize from './__tests__/tok'

describe('tokenize list item', () => {
  it('knows list items', () => {
    // unordered
    expect(tokenize('- buy milk')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "buy milk",
    "type": "text",
    "value": "buy milk",
  },
]
`)
    expect(tokenize('+ buy milk')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "+",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "buy milk",
    "type": "text",
    "value": "buy milk",
  },
]
`)
    // ordered
    expect(tokenize('1. buy milk')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "1.",
    "indent": 0,
    "ordered": true,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "buy milk",
    "type": "text",
    "value": "buy milk",
  },
]
`)
    expect(tokenize('12. buy milk')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "12.",
    "indent": 0,
    "ordered": true,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "buy milk",
    "type": "text",
    "value": "buy milk",
  },
]
`)
    expect(tokenize('123) buy milk')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "123)",
    "indent": 0,
    "ordered": true,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "buy milk",
    "type": "text",
    "value": "buy milk",
  },
]
`)
    // checkbox
    expect(tokenize('- [x] buy milk checked')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "[x]",
    "checked": true,
    "type": "list.item.checkbox",
  },
  Object {
    "_text": "buy milk checked",
    "type": "text",
    "value": "buy milk checked",
  },
]
`)
    expect(tokenize('- [X] buy milk checked')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "[X]",
    "checked": true,
    "type": "list.item.checkbox",
  },
  Object {
    "_text": "buy milk checked",
    "type": "text",
    "value": "buy milk checked",
  },
]
`)
    expect(tokenize('- [-] buy milk checked')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "[-]",
    "checked": true,
    "type": "list.item.checkbox",
  },
  Object {
    "_text": "buy milk checked",
    "type": "text",
    "value": "buy milk checked",
  },
]
`)
    expect(tokenize('- [ ] buy milk unchecked')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "[ ]",
    "checked": false,
    "type": "list.item.checkbox",
  },
  Object {
    "_text": "buy milk unchecked",
    "type": "text",
    "value": "buy milk unchecked",
  },
]
`)
    // indent
    expect(tokenize('  - buy milk')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 2,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "buy milk",
    "type": "text",
    "value": "buy milk",
  },
]
`)
    // tag
    expect(tokenize('- item1 :: description here')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "item1",
    "type": "list.item.tag",
    "value": "item1",
  },
  Object {
    "_text": "description here",
    "type": "text",
    "value": "description here",
  },
]
`)
    expect(tokenize('- item2\n :: description here')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "item2",
    "type": "text",
    "value": "item2",
  },
  Object {
    "_text": "
",
    "type": "newline",
  },
  Object {
    "_text": ":: description here",
    "type": "text",
    "value": ":: description here",
  },
]
`)
    expect(tokenize('- [x] item3 :: description here')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "[x]",
    "checked": true,
    "type": "list.item.checkbox",
  },
  Object {
    "_text": "item3",
    "type": "list.item.tag",
    "value": "item3",
  },
  Object {
    "_text": "description here",
    "type": "text",
    "value": "description here",
  },
]
`)
  })

  it('knows these are not list items', () => {
    expect(tokenize('-not item')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-not item",
    "type": "text",
    "value": "-not item",
  },
]
`)
    expect(tokenize('1.not item')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "1.not item",
    "type": "text",
    "value": "1.not item",
  },
]
`)
    expect(tokenize('8)not item')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "8)not item",
    "type": "text",
    "value": "8)not item",
  },
]
`)
    expect(tokenize('8a) not item')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "8a) not item",
    "type": "text",
    "value": "8a) not item",
  },
]
`)
  })
})
