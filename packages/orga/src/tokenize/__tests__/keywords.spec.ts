import { tokenize } from '../index'

describe('tokenize keywords', () => {

  it('knows keywords', () => {
    expect(tokenize('#+KEY: Value').all()).toMatchSnapshot()
    expect(tokenize('#+KEY: Another Value').all()).toMatchSnapshot()
    expect(tokenize('#+KEY: value : Value').all()).toMatchSnapshot()
  })

  it('knows these are not keywords', () => {
    expect(tokenize('#+KEY : Value').all()).toMatchSnapshot()
    expect(tokenize('#+KE Y: Value').all()).toMatchSnapshot()
  })

})
