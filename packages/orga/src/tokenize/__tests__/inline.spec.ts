import tok from "./tok"

describe("Inline Tokenization", () => {
  it("recon single character", () => {
    expect(tok("a")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "a",
          "type": "text.plain",
          "value": "a",
        },
      ]
    `)
  });
  it("recon two characters", () => {
    expect(tok("ab")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "ab",
          "type": "text.plain",
          "value": "ab",
        },
      ]
    `)
  });
  it("recon single emphasis", () => {
    expect(tok("hello *world*, welcome to *org-mode*.")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text.plain",
          "value": "hello ",
        },
        Object {
          "_text": "*world*",
          "type": "text.bold",
          "value": "world",
        },
        Object {
          "_text": ", welcome to ",
          "type": "text.plain",
          "value": ", welcome to ",
        },
        Object {
          "_text": "*org-mode*",
          "type": "text.bold",
          "value": "org-mode",
        },
        Object {
          "_text": ".",
          "type": "text.plain",
          "value": ".",
        },
      ]
    `)
  })

  it("recon emphasises at different locations", () => {
    expect(tok("one *two* three")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "one ",
          "type": "text.plain",
          "value": "one ",
        },
        Object {
          "_text": "*two*",
          "type": "text.bold",
          "value": "two",
        },
        Object {
          "_text": " three",
          "type": "text.plain",
          "value": " three",
        },
      ]
    `)
    expect(tok("*one* two three")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*one*",
          "type": "text.bold",
          "value": "one",
        },
        Object {
          "_text": " two three",
          "type": "text.plain",
          "value": " two three",
        },
      ]
    `)
    expect(tok("one two *three*")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "one two ",
          "type": "text.plain",
          "value": "one two ",
        },
        Object {
          "_text": "*three*",
          "type": "text.bold",
          "value": "three",
        },
      ]
    `)
  })

  it("recon link", () => {
    expect(tok(`hello [[./image/logo.png]]`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text.plain",
          "value": "hello ",
        },
        Object {
          "_text": "[[./image/logo.png]]",
          "description": undefined,
          "protocol": "file",
          "search": undefined,
          "type": "link",
          "value": "./image/logo.png",
        },
      ]
    `)
    expect(tok(`hello [[Internal Link][link]]`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text.plain",
          "value": "hello ",
        },
        Object {
          "_text": "[[Internal Link][link]]",
          "description": "link",
          "protocol": "internal",
          "search": undefined,
          "type": "link",
          "value": "Internal Link",
        },
      ]
    `)
    expect(tok(`hello [[../image/logo.png][logo]]`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text.plain",
          "value": "hello ",
        },
        Object {
          "_text": "[[../image/logo.png][logo]]",
          "description": "logo",
          "protocol": "file",
          "search": undefined,
          "type": "link",
          "value": "../image/logo.png",
        },
      ]
    `)
  })

  it("recon footnote reference", () => {
    expect(tok(`hello[fn:1] world.`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text.plain",
          "value": "hello",
        },
        Object {
          "_text": "[fn:1]",
          "children": Array [],
          "label": "1",
          "type": "footnote.reference",
        },
        Object {
          "_text": " world.",
          "type": "text.plain",
          "value": " world.",
        },
      ]
    `)
  })

  it("recon anonymous footnote reference", () => {
    expect(tok('hello[fn::Anonymous] world.')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text.plain",
          "value": "hello",
        },
        Object {
          "_text": "[fn::",
          "label": "",
          "type": "footnote.inline.begin",
        },
        Object {
          "_text": "Anonymous",
          "type": "text.plain",
          "value": "Anonymous",
        },
        Object {
          "_text": "]",
          "type": "footnote.reference.end",
        },
        Object {
          "_text": " world.",
          "type": "text.plain",
          "value": " world.",
        },
      ]
    `)
  })

  it("recon anonymous footnote reference with inner footnote reference", () => {
    expect(tok('hello[fn::[fn::Anonymous]] world.')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text.plain",
          "value": "hello",
        },
        Object {
          "_text": "[fn::",
          "label": "",
          "type": "footnote.inline.begin",
        },
        Object {
          "_text": "[fn::",
          "label": "",
          "type": "footnote.inline.begin",
        },
        Object {
          "_text": "Anonymous",
          "type": "text.plain",
          "value": "Anonymous",
        },
        Object {
          "_text": "]",
          "type": "footnote.reference.end",
        },
        Object {
          "_text": "]",
          "type": "footnote.reference.end",
        },
        Object {
          "_text": " world.",
          "type": "text.plain",
          "value": " world.",
        },
      ]
    `)
  })

  it("recon anonymous footnote reference with empty body", () => {
    expect(tok('hello[fn::] world.')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text.plain",
          "value": "hello",
        },
        Object {
          "_text": "[fn::",
          "label": "",
          "type": "footnote.inline.begin",
        },
        Object {
          "_text": "",
          "type": "text.plain",
          "value": "",
        },
        Object {
          "_text": "]",
          "type": "footnote.reference.end",
        },
        Object {
          "_text": " world.",
          "type": "text.plain",
          "value": " world.",
        },
      ]
    `)
  })

  it("recon named inline footnote", () => {
    expect(tok('hello[fn:named:Inline named footnote] world.')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text.plain",
          "value": "hello",
        },
        Object {
          "_text": "[fn:named:",
          "label": "named",
          "type": "footnote.inline.begin",
        },
        Object {
          "_text": "Inline named footnote",
          "type": "text.plain",
          "value": "Inline named footnote",
        },
        Object {
          "_text": "]",
          "type": "footnote.reference.end",
        },
        Object {
          "_text": " world.",
          "type": "text.plain",
          "value": " world.",
        },
      ]
    `)
  })

  it("recon invalid inline markups", () => {
    expect(tok(`*,word*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*,word*",
          "type": "text.plain",
          "value": "*,word*",
        },
      ]
    `)
    expect(tok(`*word,*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*word,*",
          "type": "text.plain",
          "value": "*word,*",
        },
      ]
    `)
    expect(tok(`*'word*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*'word*",
          "type": "text.plain",
          "value": "*'word*",
        },
      ]
    `)
    expect(tok(`*word'*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*word'*",
          "type": "text.plain",
          "value": "*word'*",
        },
      ]
    `)

    expect(tok(`*"word*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*\\"word*",
          "type": "text.plain",
          "value": "*\\"word*",
        },
      ]
    `)
    expect(tok(`*word"*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*word\\"*",
          "type": "text.plain",
          "value": "*word\\"*",
        },
      ]
    `)

    for (const markupChar of ["*", "=", "/", "+", "_", "~"]) {
      for (let n = 1; n <= 2; n++) {
        expect(tok(markupChar.repeat(n))).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "${markupChar.repeat(n)}",
          "type": "text.plain",
          "value": "${markupChar.repeat(n)}",
        },
      ]
`);
      }
    }

    expect(tok(`* word*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "word*",
          "type": "text.plain",
          "value": "word*",
        },
      ]
    `)
    expect(tok(`*word *`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*word *",
          "type": "text.plain",
          "value": "*word *",
        },
      ]
    `)
  })

  it("recon emphasises with 2 chars", () => {
    expect(tok(`*12*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*12*",
          "type": "text.bold",
          "value": "12",
        },
      ]
    `)
    expect(tok(`*1*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*1*",
          "type": "text.bold",
          "value": "1",
        },
      ]
    `)
  })

  it("recon mixed emphasis", () => {
    expect(
      tok(
        "[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~, the round pegs in the +round+ square holes..."
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[[https://github.com/xiaoxinghu/orgajs][Here's]]",
          "description": "Here's",
          "protocol": "https",
          "search": undefined,
          "type": "link",
          "value": "https://github.com/xiaoxinghu/orgajs",
        },
        Object {
          "_text": " to the ",
          "type": "text.plain",
          "value": " to the ",
        },
        Object {
          "_text": "*crazy*",
          "type": "text.bold",
          "value": "crazy",
        },
        Object {
          "_text": " ones, the ",
          "type": "text.plain",
          "value": " ones, the ",
        },
        Object {
          "_text": "/misfits/",
          "type": "text.italic",
          "value": "misfits",
        },
        Object {
          "_text": ", the ",
          "type": "text.plain",
          "value": ", the ",
        },
        Object {
          "_text": "_rebels_",
          "type": "text.underline",
          "value": "rebels",
        },
        Object {
          "_text": ", the ",
          "type": "text.plain",
          "value": ", the ",
        },
        Object {
          "_text": "~troublemakers~",
          "type": "text.code",
          "value": "troublemakers",
        },
        Object {
          "_text": ", the round pegs in the ",
          "type": "text.plain",
          "value": ", the round pegs in the ",
        },
        Object {
          "_text": "+round+",
          "type": "text.strikeThrough",
          "value": "round",
        },
        Object {
          "_text": " square holes...",
          "type": "text.plain",
          "value": " square holes...",
        },
      ]
    `)
  })

  it("can handle something more complicated", () => {
    const content = `
Special characters =~= and =!=. Also =~/.this/path= and ~that~ thing.
`
    expect(tok(content)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "Special characters ",
          "type": "text.plain",
          "value": "Special characters ",
        },
        Object {
          "_text": "=~=",
          "type": "text.verbatim",
          "value": "~",
        },
        Object {
          "_text": " and ",
          "type": "text.plain",
          "value": " and ",
        },
        Object {
          "_text": "=!=",
          "type": "text.verbatim",
          "value": "!",
        },
        Object {
          "_text": ". Also ",
          "type": "text.plain",
          "value": ". Also ",
        },
        Object {
          "_text": "=~/.this/path=",
          "type": "text.verbatim",
          "value": "~/.this/path",
        },
        Object {
          "_text": " and ",
          "type": "text.plain",
          "value": " and ",
        },
        Object {
          "_text": "~that~",
          "type": "text.code",
          "value": "that",
        },
        Object {
          "_text": " thing.",
          "type": "text.plain",
          "value": " thing.",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
      ]
    `)
  })
})
