import tok from './tok'

describe('tokenize block', () => {
  it('knows block begins', () => {
    expect(tok('#+BEGIN_SRC swift')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+BEGIN_SRC swift",
          "name": "SRC",
          "params": Array [
            "swift",
          ],
          "type": "block.begin",
        },
      ]
    `)

    expect(tok('#+begin_src swift')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begin_src swift",
          "name": "src",
          "params": Array [
            "swift",
          ],
          "type": "block.begin",
        },
      ]
    `)
    expect(tok('#+begin_example')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begin_example",
          "name": "example",
          "params": Array [],
          "type": "block.begin",
        },
      ]
    `)
    expect(tok('#+begin_ex😀mple')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begin_ex😀mple",
          "name": "ex😀mple",
          "params": Array [],
          "type": "block.begin",
        },
      ]
    `)
    expect(tok('#+begin_src swift :tangle code.swift')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begin_src swift :tangle code.swift",
          "name": "src",
          "params": Array [
            "swift",
            ":tangle",
            "code.swift",
          ],
          "type": "block.begin",
        },
      ]
    `)
  })

  it('knows these are not block begins', () => {
    expect(tok('#+begi😀n_src swift')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "#+begi😀n_src swift",
    "type": "text",
    "value": "#+begi😀n_src swift",
  },
]
`)
  })

  it('knows block ends', () => {
    expect(tok('#+END_SRC')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+END_SRC",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok('  #+END_SRC')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+END_SRC",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok('#+end_src')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_src",
          "name": "src",
          "type": "block.end",
        },
      ]
    `)
    expect(tok('#+end_SRC')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_SRC",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok('#+end_S😀RC')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_S😀RC",
          "name": "S😀RC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok('#+end_SRC ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_SRC ",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
  })

  it('knows these are not block ends', () => {
    expect(tok('#+end_src param')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "#+end_src param",
    "type": "text",
    "value": "#+end_src param",
  },
]
`)
  })
})
