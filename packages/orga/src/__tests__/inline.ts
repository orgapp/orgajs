import { parse, tokenize  } from '../inline'
import { map } from '../position'

const debug = (text: string) => {
  const { substring } = map(text)
  const tokens = tokenize(text)
  tokens.forEach(token => {
    console.log({
      ...token,
      content: substring(token.position) })
  })
}

describe('Inline Parsing', () => {
  it('recon single emphasis', () => {

    const str = 'hello *world*, welcome to *org-mode*. Have a nice *day*.'
    expect(tokenize(str)).toMatchSnapshot()
  })

  it('recon mixed emphasis', () => {

    const str = `
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~, the round pegs in the +round+ square holes...
`
    expect(tokenize(str)).toMatchSnapshot()
  })

  it('recon emphasises at different locations', () => {
    expect(tokenize(`one *two* three`)).toMatchSnapshot()
    expect(tokenize(`*one* two three`)).toMatchSnapshot()
    expect(tokenize(`one two *three*`)).toMatchSnapshot()
  })

  it('recon link', () => {
    expect(tokenize(`hello [[./image/logo.png]]`)).toMatchSnapshot()
    expect(tokenize(`hello [[Internal Link][link]]`)).toMatchSnapshot()
    expect(tokenize(`hello [[../image/logo.png][logo]]`)).toMatchSnapshot()
  })

  it('recon footnote reference', () => {
    expect(tokenize(`hello[fn:1] world.`)).toMatchSnapshot()
  })

  it('recon emphasises with 2 chars', () => {
    expect(tokenize(`*12*`)).toMatchSnapshot()
    expect(tokenize(`*1*`)).toMatchSnapshot()
  })

  it('recon invalid inline markups', () => {
    [ ',', '\'', '"', ' ' ].forEach(c => {
      expect(tokenize(`*${c}word*`)).toMatchSnapshot() // begin
      expect(tokenize(`*word${c}*`)).toMatchSnapshot() // end
    })
  })

  it('can handle something more complicated', () => {
    const content = `
Special characters =~= and =!=. Also =~/.this/path= and ~that~ thing.
`
    expect(tokenize(content)).toMatchSnapshot()
  })
})
