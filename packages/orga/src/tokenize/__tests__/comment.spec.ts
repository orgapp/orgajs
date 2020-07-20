import { tokenize } from '../index'

describe('tokenize comment', () => {

  it('knows comments', () => {
    expect(tokenize('# a comment').all()).toMatchSnapshot()
    expect(tokenize('# ').all()).toMatchSnapshot()
    expect(tokenize('# a comment😯').all()).toMatchSnapshot()
    expect(tokenize(' # a comment').all()).toMatchSnapshot()
    expect(tokenize('  \t  # a comment').all()).toMatchSnapshot()
    expect(tokenize('#   a comment').all()).toMatchSnapshot()
    expect(tokenize('#    \t a comment').all()).toMatchSnapshot()
  })

  it('knows these are not comments', () => {
    expect(tokenize('#not a comment').all()).toMatchSnapshot()
    expect(tokenize('  #not a comment').all()).toMatchSnapshot()
  })

})
