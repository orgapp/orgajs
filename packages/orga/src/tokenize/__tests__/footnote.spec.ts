import tok from "./tok";

describe("tokenize footnote", () => {
  it("knows footnotes", () => {
    expect(tok("[fn:1] a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:1]",
          "label": "1",
          "type": "footnote.label",
        },
        Object {
          "_text": "a footnote",
          "type": "text.plain",
          "value": "a footnote",
        },
      ]
    `);
    expect(tok("[fn:word] a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:word]",
          "label": "word",
          "type": "footnote.label",
        },
        Object {
          "_text": "a footnote",
          "type": "text.plain",
          "value": "a footnote",
        },
      ]
    `);
    expect(tok("[fn:word_] a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:word_]",
          "label": "word_",
          "type": "footnote.label",
        },
        Object {
          "_text": "a footnote",
          "type": "text.plain",
          "value": "a footnote",
        },
      ]
    `);
    expect(tok("[fn:wor1d_] a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:wor1d_]",
          "label": "wor1d_",
          "type": "footnote.label",
        },
        Object {
          "_text": "a footnote",
          "type": "text.plain",
          "value": "a footnote",
        },
      ]
    `);
  });

  it("knows these are not footnotes", () => {
    expect(tok("[fn:1]: not a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:1]",
          "label": "1",
          "type": "footnote.reference",
        },
        Object {
          "_text": ": not a footnote",
          "type": "text.plain",
          "value": ": not a footnote",
        },
      ]
    `);
    expect(tok(" [fn:1] not a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:1]",
          "label": "1",
          "type": "footnote.reference",
        },
        Object {
          "_text": " not a footnote",
          "type": "text.plain",
          "value": " not a footnote",
        },
      ]
    `);
    expect(tok("[[fn:1] not a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[",
          "type": "text.plain",
          "value": "[",
        },
        Object {
          "_text": "[fn:1]",
          "label": "1",
          "type": "footnote.reference",
        },
        Object {
          "_text": " not a footnote",
          "type": "text.plain",
          "value": " not a footnote",
        },
      ]
    `);
    expect(tok("\t[fn:1] not a footnote")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "[fn:1]",
          "label": "1",
          "type": "footnote.reference",
        },
        Object {
          "_text": " not a footnote",
          "type": "text.plain",
          "value": " not a footnote",
        },
      ]
    `);
  });
});
