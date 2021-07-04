import tok from "./tok"

describe("tokenize block", () => {
  it("knows block begins", () => {
    expect(tok("#+BEGIN_SRC swift")).toMatchInlineSnapshot(`
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

    expect(tok("#+begin_src swift")).toMatchInlineSnapshot(`
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
    expect(tok("#+begin_example")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begin_example",
          "name": "example",
          "params": Array [],
          "type": "block.begin",
        },
      ]
    `)
    expect(tok("#+begin_ex😀mple")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begin_ex😀mple",
          "name": "ex😀mple",
          "params": Array [],
          "type": "block.begin",
        },
      ]
    `)
    expect(tok("#+begin_src swift :tangle code.swift")).toMatchInlineSnapshot(`
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

  it("knows these are not block begins", () => {
    expect(tok("#+begi😀n_src swift")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+begi😀n_src swift",
          "type": "text.plain",
          "value": "#+begi😀n_src swift",
        },
      ]
    `)
  })

  it("knows block ends", () => {
    expect(tok("#+END_SRC")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+END_SRC",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok("  #+END_SRC")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+END_SRC",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok("#+end_src")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_src",
          "name": "src",
          "type": "block.end",
        },
      ]
    `)
    expect(tok("#+end_SRC")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_SRC",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok("#+end_S😀RC")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_S😀RC",
          "name": "S😀RC",
          "type": "block.end",
        },
      ]
    `)
    expect(tok("#+end_SRC ")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_SRC ",
          "name": "SRC",
          "type": "block.end",
        },
      ]
    `)
  })

  it("knows these are not block ends", () => {
    expect(tok("#+end_src param")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+end_src param",
          "type": "text.plain",
          "value": "#+end_src param",
        },
      ]
    `)
  })

  describe("verse blocks", () => {
    it('inner block tokenized as text', () => {
      expect(tok(`#+BEGIN_VERSE
#+BEGIN_SRC ts
function () {}
#+END_SRC
#+END_VERSE`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+BEGIN_VERSE",
          "name": "VERSE",
          "params": Array [],
          "type": "block.begin",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+BEGIN_SRC ts",
          "type": "text.plain",
          "value": "#+BEGIN_SRC ts",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "function () {}",
          "type": "text.plain",
          "value": "function () {}",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_SRC",
          "type": "text.plain",
          "value": "#+END_SRC",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_VERSE",
          "name": "VERSE",
          "type": "block.end",
        },
      ]
    `)
    });

    it('inner block with markup', () => {
      expect(tok(`#+BEGIN_VERSE
#+BEGIN_EXAMPLE *text*
more text
#+END_EXAMPLE
#+END_VERSE`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+BEGIN_VERSE",
          "name": "VERSE",
          "params": Array [],
          "type": "block.begin",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+BEGIN_EXAMPLE ",
          "type": "text.plain",
          "value": "#+BEGIN_EXAMPLE ",
        },
        Object {
          "_text": "*text*",
          "type": "text.bold",
          "value": "text",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "more text",
          "type": "text.plain",
          "value": "more text",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_EXAMPLE",
          "type": "text.plain",
          "value": "#+END_EXAMPLE",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_VERSE",
          "name": "VERSE",
          "type": "block.end",
        },
      ]
    `)
    });

    it('heading with markup', () => {
      expect(tok(`#+BEGIN_VERSE
* Heading *with markup*
#+END_VERSE`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+BEGIN_VERSE",
          "name": "VERSE",
          "params": Array [],
          "type": "block.begin",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "* Heading ",
          "type": "text.plain",
          "value": "* Heading ",
        },
        Object {
          "_text": "*with markup*",
          "type": "text.bold",
          "value": "with markup",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_VERSE",
          "name": "VERSE",
          "type": "block.end",
        },
      ]
    `)
    });

    it('lists not tokenized', () => {
      expect(tok(`#+BEGIN_VERSE
- this is not lexed

1. nor is this
#+END_VERSE`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+BEGIN_VERSE",
          "name": "VERSE",
          "params": Array [],
          "type": "block.begin",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "- this is not lexed",
          "type": "text.plain",
          "value": "- this is not lexed",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "1. nor is this",
          "type": "text.plain",
          "value": "1. nor is this",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_VERSE",
          "name": "VERSE",
          "type": "block.end",
        },
      ]
    `)
    });

    it('comments not tokenized', () => {
      expect(tok(`#+BEGIN_VERSE
# comment
#+END_VERSE`)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+BEGIN_VERSE",
          "name": "VERSE",
          "params": Array [],
          "type": "block.begin",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "# comment",
          "type": "text.plain",
          "value": "# comment",
        },
        Object {
          "_text": "
      ",
          "type": "newline",
        },
        Object {
          "_text": "#+END_VERSE",
          "name": "VERSE",
          "type": "block.end",
        },
      ]
    `)
    });
  });
})
