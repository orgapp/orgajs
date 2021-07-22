import tok from './tok'

describe('tokenize hr', () => {
  it('knows horizontal rules', () => {
    expect(tok('-----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----",
          "type": "hr",
        },
      ]
    `)
    expect(tok('------')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "------",
          "type": "hr",
        },
      ]
    `)
    expect(tok('--------')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "--------",
          "type": "hr",
        },
      ]
    `)
    expect(tok('  -----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----",
          "type": "hr",
        },
      ]
    `)
    expect(tok('-----   ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----   ",
          "type": "hr",
        },
      ]
    `)
    expect(tok('  -----   ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----   ",
          "type": "hr",
        },
      ]
    `)
    expect(tok('  -----  \t ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----  	 ",
          "type": "hr",
        },
      ]
    `)
  })

  it('knows these are not horizontal rules', () => {
    expect(tok('----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "----",
          "type": "text.plain",
          "value": "----",
        },
      ]
    `)
    expect(tok('- ----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-",
          "indent": 0,
          "ordered": false,
          "type": "list.item.bullet",
        },
        Object {
          "_text": "----",
          "type": "text.plain",
          "value": "----",
        },
      ]
    `)
    expect(tok('-----a')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----a",
          "type": "text.plain",
          "value": "-----a",
        },
      ]
    `)
    expect(tok('_-----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "_-----",
          "type": "text.plain",
          "value": "_-----",
        },
      ]
    `)
    expect(tok('-----    a')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "-----    a",
          "type": "text.plain",
          "value": "-----    a",
        },
      ]
    `)
  })
})
