import tokenize from './__tests__/tok'

describe('tokenize hr', () => {
  it('knows horizontal rules', () => {
    expect(tokenize('-----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----",
          "type": "hr",
        },
      ]
    `)
    expect(tokenize('------')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "------",
          "type": "hr",
        },
      ]
    `)
    expect(tokenize('--------')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "--------",
          "type": "hr",
        },
      ]
    `)
    expect(tokenize('  -----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----",
          "type": "hr",
        },
      ]
    `)
    expect(tokenize('-----   ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----   ",
          "type": "hr",
        },
      ]
    `)
    expect(tokenize('  -----   ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----   ",
          "type": "hr",
        },
      ]
    `)
    expect(tokenize('  -----  \t ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----  	 ",
          "type": "hr",
        },
      ]
    `)
  })

  it('knows these are not horizontal rules', () => {
    expect(tokenize('----')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "----",
    "type": "text",
    "value": "----",
  },
]
`)
    expect(tokenize('- ----')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-",
    "indent": 0,
    "ordered": false,
    "type": "list.item.bullet",
  },
  Object {
    "_text": "----",
    "type": "text",
    "value": "----",
  },
]
`)
    expect(tokenize('-----a')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-----a",
    "type": "text",
    "value": "-----a",
  },
]
`)
    expect(tokenize('_-----')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "_-----",
    "type": "text",
    "value": "_-----",
  },
]
`)
    expect(tokenize('-----    a')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "-----    a",
    "type": "text",
    "value": "-----    a",
  },
]
`)
  })
})
