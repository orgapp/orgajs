import parse from './uri'

describe('Parsing Link', () => {
  it('recon local file', () => {
    expect(parse(`file:/hello.org`)).toMatchInlineSnapshot(`
Object {
  "protocol": "file",
  "search": undefined,
  "value": "/hello.org",
}
`)
    expect(parse(`./hello.org`)).toMatchInlineSnapshot(`
Object {
  "protocol": "file",
  "search": undefined,
  "value": "./hello.org",
}
`)
    expect(parse(`./hello.org::23`)).toMatchInlineSnapshot(`
Object {
  "protocol": "file",
  "search": 23,
  "value": "./hello.org",
}
`)
    expect(parse(`./hello.org::*shopping list`)).toMatchInlineSnapshot(`
Object {
  "protocol": "file",
  "search": "*shopping list",
  "value": "./hello.org",
}
`)
    expect(parse(`./hello.org::apple pie`)).toMatchInlineSnapshot(`
Object {
  "protocol": "file",
  "search": "apple pie",
  "value": "./hello.org",
}
`)
  })

  it('recon other protocol', () => {
    expect(parse(`http://google.com`)).toMatchInlineSnapshot(`
Object {
  "protocol": "http",
  "search": undefined,
  "value": "http://google.com",
}
`)
    expect(parse(`mailto:dawnstar.hu@gmail.com`)).toMatchInlineSnapshot(`
Object {
  "protocol": "mailto",
  "search": undefined,
  "value": "dawnstar.hu@gmail.com",
}
`)
  })
})
