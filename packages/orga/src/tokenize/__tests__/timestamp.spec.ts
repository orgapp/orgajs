import { parse } from "../timestamp";

const p = (text: string) => {
  return parse(text, { timezone: 'Pacific/Auckland' })
}

describe("timestamps", () => {
  it("can parse timestamps", () => {
    // TODO: fix this - this isn't correct because it should just be
    // 2021-04-24 in the user's LOCAL TIME - we shouldn't be making
    // assumptions yet (2021-07-12)
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
