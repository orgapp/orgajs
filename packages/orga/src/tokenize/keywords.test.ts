import tokenize from './__tests__/tok'

describe('tokenize keywords', () => {
  it('knows keywords', () => {
    expect(tokenize('#+KEY: Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KEY: Value",
          "key": "KEY",
          "type": "keyword",
          "value": "Value",
        },
      ]
    `)
    expect(tokenize('#+KEY: Another Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KEY: Another Value",
          "key": "KEY",
          "type": "keyword",
          "value": "Another Value",
        },
      ]
    `)
    expect(tokenize('#+KEY: value : Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KEY: value : Value",
          "key": "KEY",
          "type": "keyword",
          "value": "value : Value",
        },
      ]
    `)
  })

  it('knows these are not keywords', () => {
    expect(tokenize('#+KEY : Value')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "#+KEY : Value",
    "type": "text",
    "value": "#+KEY : Value",
  },
]
`)
    expect(tokenize('#+KE Y: Value')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "#+KE Y: Value",
    "type": "text",
    "value": "#+KE Y: Value",
  },
]
`)
  })
})
