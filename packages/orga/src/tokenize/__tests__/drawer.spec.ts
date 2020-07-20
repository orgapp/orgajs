import { tokenize } from '../index'

describe('tokenize drawer', () => {

  it('knows drawer begins', () => {
    expect(tokenize(':PROPERTIES:').all()).toMatchSnapshot()
    expect(tokenize('  :properties:').all()).toMatchSnapshot()
    expect(tokenize('  :properties:  ').all()).toMatchSnapshot()
    expect(tokenize('  :prop_erties:  ').all()).toMatchSnapshot()
  })

  it('knows these are not drawer begins', () => {
    expect(tokenize('PROPERTIES:').all()).toMatchSnapshot()
    expect(tokenize(':PROPERTIES').all()).toMatchSnapshot()
    expect(tokenize(':PR OPERTIES:').all()).toMatchSnapshot()
  })

  it('knows drawer ends', () => {
    expect(tokenize(':END:').all()).toMatchSnapshot()
    expect(tokenize('  :end:').all()).toMatchSnapshot()
    expect(tokenize('  :end:  ').all()).toMatchSnapshot()
    expect(tokenize('  :end:  ').all()).toMatchSnapshot()
  })

  it('knows these are not drawer ends', () => {
    expect(tokenize('END:').all()).toMatchSnapshot()
    expect(tokenize(':END').all()).toMatchSnapshot()
    expect(tokenize(':ENDed').all()).toMatchSnapshot()
  })

})
