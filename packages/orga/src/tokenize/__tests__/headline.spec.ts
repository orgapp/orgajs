import tok from "./tok"

describe("tokenize headline", () => {
  it("knows headlines", () => {
    expect(tok("** a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_text": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
      ]
    `)

    expect(tok("** _headline_")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_text": "_headline_",
          "type": "text.underline",
          "value": "headline",
        },
      ]
    `)

    expect(tok("**   a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_text": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
      ]
    `)

    expect(tok("***** a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*****",
          "level": 5,
          "type": "stars",
        },
        Object {
          "_text": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
      ]
    `)

    expect(tok("* a 😀line")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "a 😀line",
          "type": "text.plain",
          "value": "a 😀line",
        },
      ]
    `)

    expect(tok("* TODO [#A] a headline     :tag1:tag2:"))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "TODO",
          "actionable": true,
          "keyword": "TODO",
          "type": "todo",
        },
        Object {
          "_text": "[#A]",
          "type": "priority",
          "value": "[#A]",
        },
        Object {
          "_text": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
        Object {
          "_text": ":tag1:tag2:",
          "tags": Array [
            "tag1",
            "tag2",
          ],
          "type": "tags",
        },
      ]
    `)

    expect(
      tok(
        "* TODO [#A] a headline :tag1:123:#hash:@at:org-mode:under_score:98%:"
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "TODO",
          "actionable": true,
          "keyword": "TODO",
          "type": "todo",
        },
        Object {
          "_text": "[#A]",
          "type": "priority",
          "value": "[#A]",
        },
        Object {
          "_text": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
        Object {
          "_text": ":tag1:123:#hash:@at:org-mode:under_score:98%:",
          "tags": Array [
            "tag1",
            "123",
            "#hash",
            "@at",
            "org-mode",
            "under_score",
            "98%",
          ],
          "type": "tags",
        },
      ]
    `)
  })

  it("knows these are not headlines", () => {
    expect(tok("*not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*not a headline",
          "type": "text.plain",
          "value": "*not a headline",
        },
      ]
    `)

    expect(tok(" * not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "* not a headline",
          "type": "text.plain",
          "value": "* not a headline",
        },
      ]
    `)
    expect(tok("*_* not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*_*",
          "type": "text.bold",
          "value": "_",
        },
        Object {
          "_text": " not a headline",
          "type": "text.plain",
          "value": " not a headline",
        },
      ]
    `)
    expect(tok("not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "not a headline",
          "type": "text.plain",
          "value": "not a headline",
        },
      ]
    `)
  })
})
