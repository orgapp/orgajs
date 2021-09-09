import parse from '.'

describe('metadata parser', () => {
  it('works', () => {
    expect(parse('#+title: hello world')).toMatchInlineSnapshot(`
      Object {
        "title": "hello world",
      }
    `)
  })

  it('can handle multiple entries', () => {
    expect(
      parse(`
#+include: file1.org
#+include: ../file2.org
`)
    ).toMatchInlineSnapshot(`
      Object {
        "include": Array [
          "file1.org",
          "../file2.org",
        ],
      }
    `)
  })

  it('can handle spaces at the front', () => {
    expect(
      parse(`
  #+title: orga
    #+keywords: parser ast
`)
    ).toMatchInlineSnapshot(`
      Object {
        "keywords": "parser ast",
        "title": "orga",
      }
    `)
  })

  it('transform keys to lowercase', () => {
    expect(
      parse(`
#+TODO: TODO NEXT | DONE
#+todo: DRAFT | PUBLISHED
`)
    ).toMatchInlineSnapshot(`
      Object {
        "todo": Array [
          "TODO NEXT | DONE",
          "DRAFT | PUBLISHED",
        ],
      }
    `)
  })

  it('strips quotes if necessary', () => {
    expect(
      parse(`
#+include: "./file1.org"
#+include: './file2.org'
#+desc: it's good
`)
    ).toMatchInlineSnapshot(`
      Object {
        "desc": "it's good",
        "include": Array [
          "./file1.org",
          "./file2.org",
        ],
      }
    `)
  })
})
