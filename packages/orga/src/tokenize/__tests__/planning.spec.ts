import tok from './tok'

const options = {
  timezone: 'Pacific/Auckland',
}

describe('tokenize planning', () => {
  it('knows plannings', () => {
    expect(tok('DEADLINE: <2018-01-01 Mon>', options)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "type": "planning.keyword",
          "value": "DEADLINE",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "type": "planning.timestamp",
          "value": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
        },
      ]
    `)
    expect(tok('  DEADLINE: <2018-01-01 Mon>', options)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "type": "planning.keyword",
          "value": "DEADLINE",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "type": "planning.timestamp",
          "value": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
        },
      ]
    `)
    expect(tok(' \tDEADLINE: <2018-01-01 Mon>', options))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "type": "planning.keyword",
          "value": "DEADLINE",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "type": "planning.timestamp",
          "value": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
        },
      ]
    `)
    expect(tok(' \t DEADLINE: <2018-01-01 Mon>', options))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "type": "planning.keyword",
          "value": "DEADLINE",
        },
        Object {
          "_text": " <2018-01-01 Mon>",
          "type": "planning.timestamp",
          "value": Object {
            "date": 2017-12-31T11:00:00.000Z,
            "end": undefined,
          },
        },
      ]
    `)
  })

  it('know multiple plannings', () => {
    expect(
      tok('DEADLINE: <2020-07-03 Fri> SCHEDULED: <2020-07-03 Fri>', options)
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "DEADLINE:",
          "type": "planning.keyword",
          "value": "DEADLINE",
        },
        Object {
          "_text": " <2020-07-03 Fri> ",
          "type": "planning.timestamp",
          "value": Object {
            "date": 2020-07-02T12:00:00.000Z,
            "end": undefined,
          },
        },
        Object {
          "_text": "SCHEDULED:",
          "type": "planning.keyword",
          "value": "SCHEDULED",
        },
        Object {
          "_text": " <2020-07-03 Fri>",
          "type": "planning.timestamp",
          "value": Object {
            "date": 2020-07-02T12:00:00.000Z,
            "end": undefined,
          },
        },
      ]
    `)
  })

  it('knows these are not plannings', () => {
    expect(tok('dEADLINE: <2018-01-01 Mon>', options)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_text": "dEADLINE: <2018-01-01 Mon>",
          "type": "text.plain",
          "value": "dEADLINE: <2018-01-01 Mon>",
        },
      ]
    `)
  })
})
