import tokenize from './__tests__/tok'

describe('tokenize headline', () => {
  it('knows headlines', () => {
    expect(tokenize('** a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_text": "a headline",
          "type": "text",
          "value": "a headline",
        },
      ]
    `)

    expect(tokenize('** _headline_')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_text": "_headline_",
          "style": "underline",
          "type": "text",
          "value": "headline",
        },
      ]
    `)

    expect(tokenize('**   a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_text": "a headline",
          "type": "text",
          "value": "a headline",
        },
      ]
    `)

    expect(tokenize('***** a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*****",
          "level": 5,
          "type": "stars",
        },
        Object {
          "_text": "a headline",
          "type": "text",
          "value": "a headline",
        },
      ]
    `)

    expect(tokenize('* a 😀line')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "a 😀line",
          "type": "text",
          "value": "a 😀line",
        },
      ]
    `)

    expect(tokenize('* TODO [#A] a headline     :tag1:tag2:'))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "TODO",
          "actionable": true,
          "keyword": "TODO",
          "type": "todo",
        },
        Object {
          "_text": "[#A]",
          "type": "priority",
          "value": "[#A]",
        },
        Object {
          "_text": "a headline",
          "type": "text",
          "value": "a headline",
        },
        Object {
          "_text": ":tag1:tag2:",
          "tags": Array [
            "tag1",
            "tag2",
          ],
          "type": "tags",
        },
      ]
    `)

    expect(
      tokenize(
        '* TODO [#A] a headline :tag1:123:#hash:@at:org-mode:under_score:98%:'
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_text": "TODO",
          "actionable": true,
          "keyword": "TODO",
          "type": "todo",
        },
        Object {
          "_text": "[#A]",
          "type": "priority",
          "value": "[#A]",
        },
        Object {
          "_text": "a headline",
          "type": "text",
          "value": "a headline",
        },
        Object {
          "_text": ":tag1:123:#hash:@at:org-mode:under_score:98%:",
          "tags": Array [
            "tag1",
            "123",
            "#hash",
            "@at",
            "org-mode",
            "under_score",
            "98%",
          ],
          "type": "tags",
        },
      ]
    `)
  })

  it('knows these are not headlines', () => {
    expect(tokenize('*not a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*not a headline",
          "type": "text",
          "value": "*not a headline",
        },
      ]
    `)

    expect(tokenize(' * not a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "* not a headline",
          "type": "text",
          "value": "* not a headline",
        },
      ]
    `)
    expect(tokenize('*_* not a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "*_*",
          "style": "bold",
          "type": "text",
          "value": "_",
        },
        Object {
          "_text": " not a headline",
          "type": "text",
          "value": " not a headline",
        },
      ]
    `)
    expect(tokenize('not a headline')).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "not a headline",
          "type": "text",
          "value": "not a headline",
        },
      ]
    `)
  })
})
