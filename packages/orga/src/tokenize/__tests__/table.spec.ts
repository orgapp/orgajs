import { tokenize } from '../index'

describe('tokenize table', () => {

  it('knows table hr', () => {
    expect(tokenize('|----+---+----|').all()).toMatchSnapshot()
    expect(tokenize('|--=-+---+----|').all()).toMatchSnapshot()
    expect(tokenize('  |----+---+----|').all()).toMatchSnapshot()
    expect(tokenize('|----+---+----').all()).toMatchSnapshot()
    expect(tokenize('|---').all()).toMatchSnapshot()
    expect(tokenize('|-').all()).toMatchSnapshot()
  })

  it('knows these are not table separators', () => {
    expect(tokenize('----+---+----|').all()).toMatchSnapshot()
  })

  it('knows table rows', () => {
    expect(tokenize('| batman | superman | wonder woman |').all()).toMatchSnapshot()
    expect(tokenize('| hello | world | y\'all |').all()).toMatchSnapshot()
    expect(tokenize('   | hello | world | y\'all |').all()).toMatchSnapshot()
    expect(tokenize('|    hello |  world   |y\'all |').all()).toMatchSnapshot()
    // with empty cell
    expect(tokenize('||  world   | |').all()).toMatchSnapshot()
  })

  it('knows these are not table rows', () => {
    expect(tokenize(' hello | world | y\'all |').all()).toMatchSnapshot()
    expect(tokenize('|+').all()).toMatchSnapshot()
  })
})
