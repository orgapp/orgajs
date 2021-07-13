import { parse } from "../src/timestamp"

const p = (text: string) => {
  return parse(text, { timezone: 'Pacific/Auckland' })
}

describe("timestamp", () => {
  it("can parse timestamps", () => {
    expect(p("[2021-04-24 Sat]")).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-23T12:00:00.000Z,
        "end": undefined,
      }
    `)
    expect(p("<2021-04-24 Sat>")).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-23T12:00:00.000Z,
        "end": undefined,
      }
    `)
    expect(p("<2021-04-24 Sat 19:15>")).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-24T07:15:00.000Z,
        "end": undefined,
      }
    `)
    expect(p("<2021-04-24 Sat 19:15-22:00>")).toMatchInlineSnapshot(`
      Object {
        "date": 2021-04-24T07:15:00.000Z,
        "end": 2021-04-24T10:00:00.000Z,
      }
    `)
  })
})
