import tokenize from './__tests__/tok'

describe('tokenize comment', () => {
  it('knows comments', () => {
    expect(tokenize('# a comment')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tokenize('# ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# ",
          "type": "comment",
          "value": "",
        },
      ]
    `)
    expect(tokenize('# a comment😯')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment😯",
          "type": "comment",
          "value": "a comment😯",
        },
      ]
    `)
    expect(tokenize(' # a comment')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tokenize('  \t  # a comment')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "# a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tokenize('#   a comment')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#   a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
    expect(tokenize('#    \t a comment')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#    	 a comment",
          "type": "comment",
          "value": "a comment",
        },
      ]
    `)
  })

  it('knows these are not comments', () => {
    expect(tokenize('#not a comment')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "#not a comment",
    "type": "text",
    "value": "#not a comment",
  },
]
`)
    expect(tokenize('  #not a comment')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "#not a comment",
    "type": "text",
    "value": "#not a comment",
  },
]
`)
  })
})
