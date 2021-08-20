import tokenize from './__tests__/tok'

describe('tokenize footnote', () => {
  it('knows footnotes', () => {
    expect(tokenize('[fn:1] a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:1]",
    "label": "1",
    "type": "footnote.label",
  },
  Object {
    "_text": "a footnote",
    "type": "text",
    "value": "a footnote",
  },
]
`)
    expect(tokenize('[fn:word] a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:word]",
    "label": "word",
    "type": "footnote.label",
  },
  Object {
    "_text": "a footnote",
    "type": "text",
    "value": "a footnote",
  },
]
`)
    expect(tokenize('[fn:word_] a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:word_]",
    "label": "word_",
    "type": "footnote.label",
  },
  Object {
    "_text": "a footnote",
    "type": "text",
    "value": "a footnote",
  },
]
`)
    expect(tokenize('[fn:wor1d_] a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:wor1d_]",
    "label": "wor1d_",
    "type": "footnote.label",
  },
  Object {
    "_text": "a footnote",
    "type": "text",
    "value": "a footnote",
  },
]
`)
  })

  it('knows these are not footnotes', () => {
    expect(tokenize('[fn:1]: not a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:",
    "element": "footnote.reference",
    "type": "opening",
  },
  Object {
    "_text": "1",
    "label": "1",
    "type": "footnote.label",
  },
  Object {
    "_text": "]",
    "element": "footnote.reference",
    "type": "closing",
  },
  Object {
    "_text": ": not a footnote",
    "type": "text",
    "value": ": not a footnote",
  },
]
`)
    expect(tokenize(' [fn:1] not a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:",
    "element": "footnote.reference",
    "type": "opening",
  },
  Object {
    "_text": "1",
    "label": "1",
    "type": "footnote.label",
  },
  Object {
    "_text": "]",
    "element": "footnote.reference",
    "type": "closing",
  },
  Object {
    "_text": " not a footnote",
    "type": "text",
    "value": " not a footnote",
  },
]
`)
    expect(tokenize('[[fn:1] not a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[",
    "type": "text",
    "value": "[",
  },
  Object {
    "_text": "[fn:",
    "element": "footnote.reference",
    "type": "opening",
  },
  Object {
    "_text": "1",
    "label": "1",
    "type": "footnote.label",
  },
  Object {
    "_text": "]",
    "element": "footnote.reference",
    "type": "closing",
  },
  Object {
    "_text": " not a footnote",
    "type": "text",
    "value": " not a footnote",
  },
]
`)
    expect(tokenize('\t[fn:1] not a footnote')).toMatchInlineSnapshot(`
Array [
  Object {
    "_text": "[fn:",
    "element": "footnote.reference",
    "type": "opening",
  },
  Object {
    "_text": "1",
    "label": "1",
    "type": "footnote.label",
  },
  Object {
    "_text": "]",
    "element": "footnote.reference",
    "type": "closing",
  },
  Object {
    "_text": " not a footnote",
    "type": "text",
    "value": " not a footnote",
  },
]
`)
  })
})
