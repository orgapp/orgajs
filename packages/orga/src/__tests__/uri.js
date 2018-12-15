const parse = require('../uri')

describe('Parsing Link', () => {

  it('recon local file', () => {
    expect(parse(`file:/hello.org`)).toMatchSnapshot()
    expect(parse(`./hello.org`)).toMatchSnapshot()
    expect(parse(`./hello.org::23`)).toMatchSnapshot()
    expect(parse(`./hello.org::*shopping list`)).toMatchSnapshot()
    expect(parse(`./hello.org::apple pie`)).toMatchSnapshot()
  })

  it('recon other protocol', () => {
    expect(parse(`http://google.com`)).toMatchSnapshot()
    expect(parse(`mailto:dawnstar.hu@gmail.com`)).toMatchSnapshot()
  })
})
