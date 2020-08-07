import { read } from "text-kit";
import { tokenize } from "../index";

describe("tokenize headline", () => {
  const tok = (text: string) => {
    const { substring } = read(text);
    const tokens = tokenize(text).all();
    return tokens.map(({ position, ...rest }) => ({
      ...rest,
      _content: substring(position)
    }));
  };

  it("knows headlines", () => {
    expect(tok("** a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_content": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
      ]
    `);

    expect(tok("** _headline_")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_content": "_headline_",
          "type": "text.underline",
          "value": "headline",
        },
      ]
    `);

    expect(tok("**   a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "**",
          "level": 2,
          "type": "stars",
        },
        Object {
          "_content": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
      ]
    `);

    expect(tok("***** a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "*****",
          "level": 5,
          "type": "stars",
        },
        Object {
          "_content": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
      ]
    `);

    expect(tok("* a 😀line")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_content": "a 😀line",
          "type": "text.plain",
          "value": "a 😀line",
        },
      ]
    `);

    expect(tok("* TODO [#A] a headline     :tag1:tag2:"))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_content": "TODO",
          "actionable": true,
          "keyword": "TODO",
          "type": "todo",
        },
        Object {
          "_content": "[#A]",
          "type": "priority",
          "value": "[#A]",
        },
        Object {
          "_content": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
        Object {
          "_content": ":tag1:tag2:",
          "tags": Array [
            "tag1",
            "tag2",
          ],
          "type": "tags",
        },
      ]
    `);

    expect(tok("* TODO [#A] a headline     :tag1:tag2:"))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "*",
          "level": 1,
          "type": "stars",
        },
        Object {
          "_content": "TODO",
          "actionable": true,
          "keyword": "TODO",
          "type": "todo",
        },
        Object {
          "_content": "[#A]",
          "type": "priority",
          "value": "[#A]",
        },
        Object {
          "_content": "a headline",
          "type": "text.plain",
          "value": "a headline",
        },
        Object {
          "_content": ":tag1:tag2:",
          "tags": Array [
            "tag1",
            "tag2",
          ],
          "type": "tags",
        },
      ]
    `);
  });

  it("knows these are not headlines", () => {
    expect(tok("*not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "*not a headline",
          "type": "text.plain",
          "value": "*not a headline",
        },
      ]
    `);

    expect(tok(" * not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "* not a headline",
          "type": "text.plain",
          "value": "* not a headline",
        },
      ]
    `);
    expect(tok("*_* not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "*_*",
          "type": "text.bold",
          "value": "_",
        },
        Object {
          "_content": " not a headline",
          "type": "text.plain",
          "value": " not a headline",
        },
      ]
    `);
    expect(tok("not a headline")).toMatchInlineSnapshot(`
      Array [
        Object {
          "_content": "not a headline",
          "type": "text.plain",
          "value": "not a headline",
        },
      ]
    `);
  });
});
