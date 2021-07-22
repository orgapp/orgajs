import tok from './tok'

describe('tokenize keywords', () => {
  it('knows keywords', () => {
    expect(tok('#+KEY: Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KEY: Value",
          "key": "KEY",
          "type": "keyword",
          "value": "Value",
        },
      ]
    `)
    expect(tok('#+KEY: Another Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KEY: Another Value",
          "key": "KEY",
          "type": "keyword",
          "value": "Another Value",
        },
      ]
    `)
    expect(tok('#+KEY: value : Value')).toMatchInlineSnapshot(`
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
    expect(tok('#+KEY : Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KEY : Value",
          "type": "text.plain",
          "value": "#+KEY : Value",
        },
      ]
    `)
    expect(tok('#+KE Y: Value')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "#+KE Y: Value",
          "type": "text.plain",
          "value": "#+KE Y: Value",
        },
      ]
    `)
  })
})
