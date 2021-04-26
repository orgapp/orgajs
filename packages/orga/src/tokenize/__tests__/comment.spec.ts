import tok from "./tok"

describe("tokenize comment", () => {
  it("knows comments", () => {
    expect(tok("# a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tok("# ")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# ",
          "type": "comment",
          "value": "",
        },
      ]
    `)
    expect(tok("# a comment😯")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment😯",
          "type": "comment",
          "value": "a comment😯",
        },
      ]
    `)
    expect(tok(" # a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tok("  \t  # a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tok("#   a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#   a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tok("#    \t a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#    	 a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
  })

  it("knows these are not comments", () => {
    expect(tok("#not a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#not a comment",
          "type": "text.plain",
          "value": "#not a comment",
        },
      ]
    `)
    expect(tok("  #not a comment")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#not a comment",
          "type": "text.plain",
          "value": "#not a comment",
        },
      ]
    `)
  })
})
