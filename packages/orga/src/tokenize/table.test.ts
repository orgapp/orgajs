import tokenize from './__tests__/tok'

describe('tokenize table', () => {
  it('knows table hr', () => {
    expect(tokenize('|----+---+----|')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "|----+---+----|",
          "type": "table.hr",
        },
      ]
    `)
    expect(tokenize('|--=-+---+----|')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "|--=-+---+----|",
          "type": "table.hr",
        },
      ]
    `)
    expect(tokenize('  |----+---+----|')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "|----+---+----|",
          "type": "table.hr",
        },
      ]
    `)
    expect(tokenize('|----+---+----')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "|----+---+----",
          "type": "table.hr",
        },
      ]
    `)
    expect(tokenize('|---')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "|---",
          "type": "table.hr",
        },
      ]
    `)
    expect(tokenize('|-')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "|-",
          "type": "table.hr",
        },
      ]
    `)
  })

  it('knows these are not table separators', () => {
    expect(tokenize('----+---+----|')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "----+---+----|",
    "type": "text",
    "value": "----+---+----|",
  },
]
`)
  })

  it('knows table rows', () => {
    expect(tokenize('| batman | superman | wonder woman |'))
      .toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " batman ",
    "type": "text",
    "value": " batman ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " superman ",
    "type": "text",
    "value": " superman ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " wonder woman ",
    "type": "text",
    "value": " wonder woman ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
]
`)
    expect(tokenize("| hello | world | y'all |")).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " hello ",
    "type": "text",
    "value": " hello ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " world ",
    "type": "text",
    "value": " world ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " y'all ",
    "type": "text",
    "value": " y'all ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
]
`)
    expect(tokenize("   | hello | world | y'all |")).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " hello ",
    "type": "text",
    "value": " hello ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " world ",
    "type": "text",
    "value": " world ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " y'all ",
    "type": "text",
    "value": " y'all ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
]
`)
    expect(tokenize("|    hello |  world   |y'all |")).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": "    hello ",
    "type": "text",
    "value": "    hello ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": "  world   ",
    "type": "text",
    "value": "  world   ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": "y'all ",
    "type": "text",
    "value": "y'all ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
]
`)
    // with empty cell
    expect(tokenize('||  world   | |')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": "  world   ",
    "type": "text",
    "value": "  world   ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": " ",
    "type": "text",
    "value": " ",
  },
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
]
`)
  })

  it('knows these are not table rows', () => {
    expect(tokenize(" hello | world | y'all |")).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "hello | world | y'all |",
    "type": "text",
    "value": "hello | world | y'all |",
  },
]
`)
    expect(tokenize('|+')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "|",
    "type": "table.columnSeparator",
  },
  Object {
    "_text": "+",
    "type": "text",
    "value": "+",
  },
]
`)
  })
})
