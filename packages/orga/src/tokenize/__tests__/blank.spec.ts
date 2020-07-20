import { tokenize } from '../index'

describe('Tokenize Blanks', () => {

  it('knows blank', () => {

    expect(tokenize('').all()).toMatchSnapshot()
    expect(tokenize(' ').all()).toMatchSnapshot()
    expect(tokenize('    ').all()).toMatchSnapshot()
    expect(tokenize('\t').all()).toMatchSnapshot()
    expect(tokenize(' \t').all()).toMatchSnapshot()
    expect(tokenize('\t ').all()).toMatchSnapshot()
    expect(tokenize(' \t  ').all()).toMatchSnapshot()
  })

  it('knows these are not blanks', () => {
    expect(tokenize(' a ').all()).toMatchSnapshot()
  })

})
