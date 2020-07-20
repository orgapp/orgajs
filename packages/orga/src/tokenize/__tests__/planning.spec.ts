import { tokenize } from '../index'

describe('tokenize planning', () => {

  it('knows plannings', () => {
    expect(tokenize('DEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
    expect(tokenize('  DEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
    expect(tokenize(' \tDEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
    expect(tokenize(' \t DEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
  })

  it('knows these are not plannings', () => {
    expect(tokenize('dEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
  })

})
