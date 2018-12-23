const { parse } = require('../inline')

describe('Inline Parsing', () => {
  it('recon single emphasis', () => {

    const str = 'hello *world*, welcome to *org-mode*. Have a nice *day*.'
    expect(parse(str)).toMatchSnapshot()
  })

  it('recon mixed emphasis', () => {

    const str = `
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~, the round pegs in the +round+ square holes...
`
    expect(parse(str)).toMatchSnapshot()
  })

  it('recon emphasises at different locations', () => {
    expect(parse(`one *two* three`)).toMatchSnapshot()
    expect(parse(`*one* two three`)).toMatchSnapshot()
    expect(parse(`one two *three*`)).toMatchSnapshot()
  })

  it('recon link', () => {
    expect(parse(`hello [[./image/logo.png]]`)).toMatchSnapshot()
    expect(parse(`hello [[Internal Link][link]]`)).toMatchSnapshot()
    expect(parse(`hello [[../image/logo.png][logo]]`)).toMatchSnapshot()
  })

  it('recon footnote reference', () => {
    expect(parse(`hello[fn:1] world.`)).toMatchSnapshot()
  })

  it('recon emphasises with 2 chars', () => {
    expect(parse(`*12*`)).toMatchSnapshot()
    expect(parse(`*1*`)).toMatchSnapshot()
  })

  it('recon invalid inline markups', () => {
    [ ',', '\'', '"', ' ' ].forEach(c => {
      expect(parse(`*${c}word*`)).toMatchSnapshot() // begin
      expect(parse(`*word${c}*`)).toMatchSnapshot() // end
    })
  })
})
