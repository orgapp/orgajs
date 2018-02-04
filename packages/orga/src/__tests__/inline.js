import { parse } from '../inline'
import Node from '../node'


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
})
