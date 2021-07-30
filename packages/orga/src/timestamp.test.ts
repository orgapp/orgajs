import { parse } from './timestamp'

const p = (text: string) => {
  return parse(text, { timezone: 'Pacific/Auckland' })
}

describe('timestamp', () => {
  it('can parse timestamps', () => {
    expect(p('[2021-04-24 Sat]')).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-23T12:00:00.000Z,
        "end": undefined,
      }
    `)
    expect(p('<2021-04-24 Sat>')).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-23T12:00:00.000Z,
        "end": undefined,
      }
    `)
    expect(p('<2021-04-24 Sat 19:15>')).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-24T07:15:00.000Z,
        "end": undefined,
      }
    `)
    expect(p('<2021-04-24 Sat 19:15-22:00>')).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-24T07:15:00.000Z,
        "end": 2021-04-24T10:00:00.000Z,
      }
    `)

    expect(p('<2019-08-19 Mon>--<2019-08-20 Tue>')).toMatchInlineSnapshot(`
Object {
  "date": 2019-08-18T12:00:00.000Z,
  "end": 2019-08-19T12:00:00.000Z,
}
`)
  })
})
