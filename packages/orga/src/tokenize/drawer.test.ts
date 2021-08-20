import tokenize from './__tests__/tok'

describe('tokenize drawer', () => {
  it('knows drawer begins', () => {
    expect(tokenize(':PROPERTIES:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":PROPERTIES:",
          "name": "PROPERTIES",
          "type": "drawer.begin",
        },
      ]
    `)
    expect(tokenize('  :properties:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":properties:",
          "name": "properties",
          "type": "drawer.begin",
        },
      ]
    `)
    expect(tokenize('  :properties:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":properties:",
          "name": "properties",
          "type": "drawer.begin",
        },
      ]
    `)
    expect(tokenize('  :prop_erties:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":prop_erties:",
          "name": "prop_erties",
          "type": "drawer.begin",
        },
      ]
    `)
  })

  it('knows these are not drawer begins', () => {
    expect(tokenize('PROPERTIES:')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "PROPERTIES:",
    "type": "text",
    "value": "PROPERTIES:",
  },
]
`)
    expect(tokenize(':PROPERTIES')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": ":PROPERTIES",
    "type": "text",
    "value": ":PROPERTIES",
  },
]
`)
    expect(tokenize(':PR OPERTIES:')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": ":PR OPERTIES:",
    "type": "text",
    "value": ":PR OPERTIES:",
  },
]
`)
  })

  it('knows drawer ends', () => {
    expect(tokenize(':END:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":END:",
          "type": "drawer.end",
        },
      ]
    `)
    expect(tokenize('  :end:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":end:",
          "type": "drawer.end",
        },
      ]
    `)
    expect(tokenize('  :end:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":end:",
          "type": "drawer.end",
        },
      ]
    `)
    expect(tokenize('  :end:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":end:",
          "type": "drawer.end",
        },
      ]
    `)
  })

  it('knows these are not drawer ends', () => {
    expect(tokenize('END:')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "END:",
    "type": "text",
    "value": "END:",
  },
]
`)
    expect(tokenize(':END')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": ":END",
    "type": "text",
    "value": ":END",
  },
]
`)
    expect(tokenize(':ENDed')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": ":ENDed",
    "type": "text",
    "value": ":ENDed",
  },
]
`)
  })
})
