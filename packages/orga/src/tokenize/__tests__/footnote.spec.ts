import { tokenize } from '../index'

describe('tokenize footnote', () => {

  it('knows footnotes', () => {
    expect(tokenize('[fn:1] a footnote').all()).toMatchSnapshot()
    expect(tokenize('[fn:word] a footnote').all()).toMatchSnapshot()
    expect(tokenize('[fn:word_] a footnote').all()).toMatchSnapshot()
    expect(tokenize('[fn:wor1d_] a footnote').all()).toMatchSnapshot()
  })

  it('knows these are not footnotes', () => {
    expect(tokenize('[fn:1]: not a footnote').all()).toMatchSnapshot()
    expect(tokenize(' [fn:1] not a footnote').all()).toMatchSnapshot()
    expect(tokenize('[[fn:1] not a footnote').all()).toMatchSnapshot()
    expect(tokenize('\t[fn:1] not a footnote').all()).toMatchSnapshot()
  })

})
