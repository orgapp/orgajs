import tok from "./tok"

describe("tokenize list item", () => {
  it("knows list items", () => {
    // unordered
    expect(tok("- buy milk")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-",
          "indent": 0,
          "ordered": false,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "buy milk",
          "type": "text.plain",
          "value": "buy milk",
        },
      ]
    `)
    expect(tok("+ buy milk")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "+",
          "indent": 0,
          "ordered": false,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "buy milk",
          "type": "text.plain",
          "value": "buy milk",
        },
      ]
    `)
    // ordered
    expect(tok("1. buy milk")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "1.",
          "indent": 0,
          "ordered": true,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "buy milk",
          "type": "text.plain",
          "value": "buy milk",
        },
      ]
    `)
    expect(tok("12. buy milk")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "12.",
          "indent": 0,
          "ordered": true,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "buy milk",
          "type": "text.plain",
          "value": "buy milk",
        },
      ]
    `)
    expect(tok("123) buy milk")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "123)",
          "indent": 0,
          "ordered": true,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "buy milk",
          "type": "text.plain",
          "value": "buy milk",
        },
      ]
    `)
    // checkbox
    expect(tok("- [x] buy milk checked")).toMatchInlineSnapshot(`
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
          "type": "text.plain",
          "value": "buy milk checked",
        },
      ]
    `)
    expect(tok("- [X] buy milk checked")).toMatchInlineSnapshot(`
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
          "type": "text.plain",
          "value": "buy milk checked",
        },
      ]
    `)
    expect(tok("- [-] buy milk checked")).toMatchInlineSnapshot(`
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
          "type": "text.plain",
          "value": "buy milk checked",
        },
      ]
    `)
    expect(tok("- [ ] buy milk unchecked")).toMatchInlineSnapshot(`
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
          "type": "text.plain",
          "value": "buy milk unchecked",
        },
      ]
    `)
    // indent
    expect(tok("  - buy milk")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-",
          "indent": 2,
          "ordered": false,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "buy milk",
          "type": "text.plain",
          "value": "buy milk",
        },
      ]
    `)
    // tag
    expect(tok("- item1 :: description here")).toMatchInlineSnapshot(`
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
          "type": "text.plain",
          "value": "description here",
        },
      ]
    `)
    expect(tok("- item2\n :: description here")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-",
          "indent": 0,
          "ordered": false,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "item2",
          "type": "text.plain",
          "value": "item2",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": ":: description here",
          "type": "text.plain",
          "value": ":: description here",
        },
      ]
    `)
    expect(tok("- [x] item3 :: description here")).toMatchInlineSnapshot(`
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
          "type": "text.plain",
          "value": "description here",
        },
      ]
    `)
  })

  it("knows these are not list items", () => {
    expect(tok("-not item")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-not item",
          "type": "text.plain",
          "value": "-not item",
        },
      ]
    `)
    expect(tok("1.not item")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "1.not item",
          "type": "text.plain",
          "value": "1.not item",
        },
      ]
    `)
    expect(tok("8)not item")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "8)not item",
          "type": "text.plain",
          "value": "8)not item",
        },
      ]
    `)
    expect(tok("8a) not item")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "8a) not item",
          "type": "text.plain",
          "value": "8a) not item",
        },
      ]
    `)
  })
})
