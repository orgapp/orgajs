import tokenize from './__tests__/tok'

describe('tokenize blanks', () => {
  it('could handle blanks', () => {
    expect(tokenize('')).toMatchInlineSnapshot(`Array []`)
    expect(tokenize(' ')).toMatchInlineSnapshot(`Array []`)
    expect(tokenize('    ')).toMatchInlineSnapshot(`Array []`)
    expect(tokenize('\t')).toMatchInlineSnapshot(`Array []`)
    expect(tokenize(' \t')).toMatchInlineSnapshot(`Array []`)
    expect(tokenize('\t ')).toMatchInlineSnapshot(`Array []`)
    expect(tokenize(' \t  ')).toMatchInlineSnapshot(`Array []`)
  })

  it('knows these are not blanks', () => {
    expect(tokenize(' a ')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "a ",
    "type": "text",
    "value": "a ",
  },
]
`)
  })
})
