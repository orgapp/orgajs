import tok from './tok'

describe('tokenize blanks', () => {
  it('could handle blanks', () => {
    expect(tok('')).toMatchInlineSnapshot(`Array []`)
    expect(tok(' ')).toMatchInlineSnapshot(`Array []`)
    expect(tok('    ')).toMatchInlineSnapshot(`Array []`)
    expect(tok('\t')).toMatchInlineSnapshot(`Array []`)
    expect(tok(' \t')).toMatchInlineSnapshot(`Array []`)
    expect(tok('\t ')).toMatchInlineSnapshot(`Array []`)
    expect(tok(' \t  ')).toMatchInlineSnapshot(`Array []`)
  })

  it('knows these are not blanks', () => {
    expect(tok(' a ')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "a ",
          "type": "text.plain",
          "value": "a ",
        },
      ]
    `)
  })
})
