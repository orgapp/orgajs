import tok from "./tok";

const options = {
  timezone: "Pacific/Auckland"
};

describe("tokenize planning", () => {
  it("knows plannings", () => {
    expect(tok("DEADLINE: <2018-01-01 Mon>", options)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "keyword": "DEADLINE",
          "type": "planning.keyword",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "timestamp": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
          "type": "planning.timestamp",
        },
      ]
    `);
    expect(tok("  DEADLINE: <2018-01-01 Mon>", options)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "keyword": "DEADLINE",
          "type": "planning.keyword",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "timestamp": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
          "type": "planning.timestamp",
        },
      ]
    `);
    expect(tok(" \tDEADLINE: <2018-01-01 Mon>", options))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "keyword": "DEADLINE",
          "type": "planning.keyword",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "timestamp": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
          "type": "planning.timestamp",
        },
      ]
    `);
    expect(tok(" \t DEADLINE: <2018-01-01 Mon>", options))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "keyword": "DEADLINE",
          "type": "planning.keyword",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "timestamp": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
          "type": "planning.timestamp",
        },
      ]
    `);
  });

  it("knows these are not plannings", () => {
    expect(tok("dEADLINE: <2018-01-01 Mon>", options)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "dEADLINE: <2018-01-01 Mon>",
          "type": "text.plain",
          "value": "dEADLINE: <2018-01-01 Mon>",
        },
      ]
    `);
  });
});
