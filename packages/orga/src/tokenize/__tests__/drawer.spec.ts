import tok from './tok'

describe('tokenize drawer', () => {
  it('knows drawer begins', () => {
    expect(tok(':PROPERTIES:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":PROPERTIES:",
          "name": "PROPERTIES",
          "type": "drawer.begin",
        },
      ]
    `)
    expect(tok('  :properties:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":properties:",
          "name": "properties",
          "type": "drawer.begin",
        },
      ]
    `)
    expect(tok('  :properties:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":properties:",
          "name": "properties",
          "type": "drawer.begin",
        },
      ]
    `)
    expect(tok('  :prop_erties:  ')).toMatchInlineSnapshot(`
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
    expect(tok('PROPERTIES:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "PROPERTIES:",
          "type": "text.plain",
          "value": "PROPERTIES:",
        },
      ]
    `)
    expect(tok(':PROPERTIES')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":PROPERTIES",
          "type": "text.plain",
          "value": ":PROPERTIES",
        },
      ]
    `)
    expect(tok(':PR OPERTIES:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":PR OPERTIES:",
          "type": "text.plain",
          "value": ":PR OPERTIES:",
        },
      ]
    `)
  })

  it('knows drawer ends', () => {
    expect(tok(':END:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":END:",
          "type": "drawer.end",
        },
      ]
    `)
    expect(tok('  :end:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":end:",
          "type": "drawer.end",
        },
      ]
    `)
    expect(tok('  :end:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":end:",
          "type": "drawer.end",
        },
      ]
    `)
    expect(tok('  :end:  ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":end:",
          "type": "drawer.end",
        },
      ]
    `)
  })

  it('knows these are not drawer ends', () => {
    expect(tok('END:')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "END:",
          "type": "text.plain",
          "value": "END:",
        },
      ]
    `)
    expect(tok(':END')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":END",
          "type": "text.plain",
          "value": ":END",
        },
      ]
    `)
    expect(tok(':ENDed')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": ":ENDed",
          "type": "text.plain",
          "value": ":ENDed",
        },
      ]
    `)
  })
})
