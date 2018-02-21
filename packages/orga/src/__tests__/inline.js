import { parse } from '../inline'

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
    expect(parse(`hello [[image/logo.png]]`)).toMatchSnapshot()
    expect(parse(`hello [[image/logo.png][logo]]`)).toMatchSnapshot()
  })

  it('recon footnote reference', () => {
    expect(parse(`hello[fn:1] world.`)).toMatchSnapshot()
  })
})
