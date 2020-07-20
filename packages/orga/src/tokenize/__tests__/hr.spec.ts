import { tokenize } from '../index'

describe('tokenize hr', () => {

  it('knows horizontal rules', () => {
    expect(tokenize('-----').all()).toMatchSnapshot()
    expect(tokenize('------').all()).toMatchSnapshot()
    expect(tokenize('--------').all()).toMatchSnapshot()
    expect(tokenize('  -----').all()).toMatchSnapshot()
    expect(tokenize('-----   ').all()).toMatchSnapshot()
    expect(tokenize('  -----   ').all()).toMatchSnapshot()
    expect(tokenize('  -----  \t ').all()).toMatchSnapshot()
  })

  it('knows these are not horizontal rules', () => {
    expect(tokenize('----').all()).toMatchSnapshot()
    expect(tokenize('- ----').all()).toMatchSnapshot()
    expect(tokenize('-----a').all()).toMatchSnapshot()
    expect(tokenize('_-----').all()).toMatchSnapshot()
    expect(tokenize('-----    a').all()).toMatchSnapshot()
  })

})
