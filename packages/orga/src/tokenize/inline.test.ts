import tokenize from './__tests__/tok'

describe('Inline Tokenization', () => {
  it('recon single emphasis', () => {
    expect(tokenize('hello *world*, welcome to *org-mode*.'))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text",
          "value": "hello ",
        },
        Object {
          "_text": "*world*",
          "style": "bold",
          "type": "text",
          "value": "world",
        },
        Object {
          "_text": ", welcome to ",
          "type": "text",
          "value": ", welcome to ",
        },
        Object {
          "_text": "*org-mode*",
          "style": "bold",
          "type": "text",
          "value": "org-mode",
        },
        Object {
          "_text": ".",
          "type": "text",
          "value": ".",
        },
      ]
    `)
  })

  it('recon emphasises at different locations', () => {
    expect(tokenize('one *two* three')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "one ",
          "type": "text",
          "value": "one ",
        },
        Object {
          "_text": "*two*",
          "style": "bold",
          "type": "text",
          "value": "two",
        },
        Object {
          "_text": " three",
          "type": "text",
          "value": " three",
        },
      ]
    `)
    expect(tokenize('*one* two three')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*one*",
          "style": "bold",
          "type": "text",
          "value": "one",
        },
        Object {
          "_text": " two three",
          "type": "text",
          "value": " two three",
        },
      ]
    `)
    expect(tokenize('one two *three*')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "one two ",
          "type": "text",
          "value": "one two ",
        },
        Object {
          "_text": "*three*",
          "style": "bold",
          "type": "text",
          "value": "three",
        },
      ]
    `)
  })

  it('recon link', () => {
    expect(tokenize(`hello [[./image/logo.png]]`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text",
          "value": "hello ",
        },
        Object {
          "_text": "[",
          "element": "link",
          "type": "opening",
        },
        Object {
          "_text": "[./image/logo.png]",
          "protocol": "file",
          "search": undefined,
          "type": "link.path",
          "value": "./image/logo.png",
        },
        Object {
          "_text": "]",
          "element": "link",
          "type": "closing",
        },
      ]
    `)
    expect(tokenize(`hello [[Internal Link][link]]`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text",
          "value": "hello ",
        },
        Object {
          "_text": "[",
          "element": "link",
          "type": "opening",
        },
        Object {
          "_text": "[Internal Link]",
          "protocol": "internal",
          "search": undefined,
          "type": "link.path",
          "value": "Internal Link",
        },
        Object {
          "_text": "link",
          "type": "text",
          "value": "link",
        },
        Object {
          "_text": "]",
          "element": "link",
          "type": "closing",
        },
      ]
    `)
    expect(tokenize(`hello [[../image/logo.png][logo]]`))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello ",
          "type": "text",
          "value": "hello ",
        },
        Object {
          "_text": "[",
          "element": "link",
          "type": "opening",
        },
        Object {
          "_text": "[../image/logo.png]",
          "protocol": "file",
          "search": undefined,
          "type": "link.path",
          "value": "../image/logo.png",
        },
        Object {
          "_text": "logo",
          "type": "text",
          "value": "logo",
        },
        Object {
          "_text": "]",
          "element": "link",
          "type": "closing",
        },
      ]
    `)

    expect(tokenize(`that is a [[../image/logo.png][/nice/ logo]]`))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "that is a ",
          "type": "text",
          "value": "that is a ",
        },
        Object {
          "_text": "[",
          "element": "link",
          "type": "opening",
        },
        Object {
          "_text": "[../image/logo.png]",
          "protocol": "file",
          "search": undefined,
          "type": "link.path",
          "value": "../image/logo.png",
        },
        Object {
          "_text": "/nice/",
          "style": "italic",
          "type": "text",
          "value": "nice",
        },
        Object {
          "_text": " logo",
          "type": "text",
          "value": " logo",
        },
        Object {
          "_text": "]",
          "element": "link",
          "type": "closing",
        },
      ]
    `)
  })

  it('recon footnote reference', () => {
    expect(tokenize(`hello[fn:1] world.`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text",
          "value": "hello",
        },
        Object {
          "_text": "[fn:",
          "element": "footnote.reference",
          "type": "opening",
        },
        Object {
          "_text": "1",
          "label": "1",
          "type": "footnote.label",
        },
        Object {
          "_text": "]",
          "element": "footnote.reference",
          "type": "closing",
        },
        Object {
          "_text": " world.",
          "type": "text",
          "value": " world.",
        },
      ]
    `)
  })

  it('recon anonymous footnote reference', () => {
    expect(tokenize('hello[fn::Anonymous] world.')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text",
          "value": "hello",
        },
        Object {
          "_text": "[fn:",
          "element": "footnote.reference",
          "type": "opening",
        },
        Object {
          "_text": "Anonymous",
          "type": "text",
          "value": "Anonymous",
        },
        Object {
          "_text": "]",
          "element": "footnote.reference",
          "type": "closing",
        },
        Object {
          "_text": " world.",
          "type": "text",
          "value": " world.",
        },
      ]
    `)
  })

  it('recon anonymous footnote reference with inner footnote reference', () => {
    expect(tokenize('hello[fn::[fn::Anonymous]] world.'))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text",
          "value": "hello",
        },
        Object {
          "_text": "[fn:",
          "element": "footnote.reference",
          "type": "opening",
        },
        Object {
          "_text": "[fn:",
          "element": "footnote.reference",
          "type": "opening",
        },
        Object {
          "_text": "Anonymous",
          "type": "text",
          "value": "Anonymous",
        },
        Object {
          "_text": "]",
          "element": "footnote.reference",
          "type": "closing",
        },
        Object {
          "_text": "]",
          "element": "footnote.reference",
          "type": "closing",
        },
        Object {
          "_text": " world.",
          "type": "text",
          "value": " world.",
        },
      ]
    `)
  })

  it('recon anonymous footnote reference with empty body', () => {
    expect(tokenize('hello[fn::] world.')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text",
          "value": "hello",
        },
        Object {
          "_text": "[fn:",
          "element": "footnote.reference",
          "type": "opening",
        },
        Object {
          "_text": "]",
          "element": "footnote.reference",
          "type": "closing",
        },
        Object {
          "_text": " world.",
          "type": "text",
          "value": " world.",
        },
      ]
    `)
  })

  it('recon named inline footnote', () => {
    expect(tokenize('hello[fn:named:Inline named footnote] world.'))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "hello",
          "type": "text",
          "value": "hello",
        },
        Object {
          "_text": "[fn:",
          "element": "footnote.reference",
          "type": "opening",
        },
        Object {
          "_text": "named",
          "label": "named",
          "type": "footnote.label",
        },
        Object {
          "_text": "Inline named footnote",
          "type": "text",
          "value": "Inline named footnote",
        },
        Object {
          "_text": "]",
          "element": "footnote.reference",
          "type": "closing",
        },
        Object {
          "_text": " world.",
          "type": "text",
          "value": " world.",
        },
      ]
    `)
  })

  it('recon invalid inline markups', () => {
    expect(tokenize(`* word*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "word*",
          "type": "text",
          "value": "word*",
        },
      ]
    `)
    expect(tokenize(`*word *`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*word *",
          "type": "text",
          "value": "*word *",
        },
      ]
    `)
  })

  it('recon emphasises with 2 chars', () => {
    expect(tokenize(`*12*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*12*",
          "style": "bold",
          "type": "text",
          "value": "12",
        },
      ]
    `)
    expect(tokenize(`*1*`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*1*",
          "style": "bold",
          "type": "text",
          "value": "1",
        },
      ]
    `)
  })

  it('recon mixed emphasis', () => {
    expect(
      tokenize(
        "[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~, the round pegs in the +round+ square holes..."
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[",
          "element": "link",
          "type": "opening",
        },
        Object {
          "_text": "[https://github.com/xiaoxinghu/orgajs]",
          "protocol": "https",
          "search": undefined,
          "type": "link.path",
          "value": "https://github.com/xiaoxinghu/orgajs",
        },
        Object {
          "_text": "Here's",
          "type": "text",
          "value": "Here's",
        },
        Object {
          "_text": "]",
          "element": "link",
          "type": "closing",
        },
        Object {
          "_text": " to the ",
          "type": "text",
          "value": " to the ",
        },
        Object {
          "_text": "*crazy*",
          "style": "bold",
          "type": "text",
          "value": "crazy",
        },
        Object {
          "_text": " ones, the ",
          "type": "text",
          "value": " ones, the ",
        },
        Object {
          "_text": "/misfits/",
          "style": "italic",
          "type": "text",
          "value": "misfits",
        },
        Object {
          "_text": ", the ",
          "type": "text",
          "value": ", the ",
        },
        Object {
          "_text": "_rebels_",
          "style": "underline",
          "type": "text",
          "value": "rebels",
        },
        Object {
          "_text": ", the ",
          "type": "text",
          "value": ", the ",
        },
        Object {
          "_text": "~troublemakers~",
          "style": "code",
          "type": "text",
          "value": "troublemakers",
        },
        Object {
          "_text": ", the round pegs in the ",
          "type": "text",
          "value": ", the round pegs in the ",
        },
        Object {
          "_text": "+round+",
          "style": "strikeThrough",
          "type": "text",
          "value": "round",
        },
        Object {
          "_text": " square holes...",
          "type": "text",
          "value": " square holes...",
        },
      ]
    `)
  })

  it('can handle something more complicated', () => {
    const content = `
Special characters =~= and =!=. Also =~/.this/path= and ~that~ thing.
`
    expect(tokenize(content)).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "
",
    "type": "emptyLine",
  },
  Object {
    "_text": "Special characters ",
    "type": "text",
    "value": "Special characters ",
  },
  Object {
    "_text": "=~=",
    "style": "verbatim",
    "type": "text",
    "value": "~",
  },
  Object {
    "_text": " and ",
    "type": "text",
    "value": " and ",
  },
  Object {
    "_text": "=!=",
    "style": "verbatim",
    "type": "text",
    "value": "!",
  },
  Object {
    "_text": ". Also ",
    "type": "text",
    "value": ". Also ",
  },
  Object {
    "_text": "=~/.this/path=",
    "style": "verbatim",
    "type": "text",
    "value": "~/.this/path",
  },
  Object {
    "_text": " and ",
    "type": "text",
    "value": " and ",
  },
  Object {
    "_text": "~that~",
    "style": "code",
    "type": "text",
    "value": "that",
  },
  Object {
    "_text": " thing.",
    "type": "text",
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
