import { tokenize } from '../index'

describe('tokenize headline', () => {

  it('knows headlines', () => {
    expect(tokenize('** a headline').all()).toMatchSnapshot()
    expect(tokenize('** _headline_').all()).toMatchSnapshot()
    expect(tokenize('**   a headline').all()).toMatchSnapshot()
    expect(tokenize('***** a headline').all()).toMatchSnapshot()
    expect(tokenize('* a 😀line').all()).toMatchSnapshot()
    expect(tokenize('* TODO [#A] a headline     :tag1:tag2:').all()).toMatchSnapshot()
  })

  it('knows these are not headlines', () => {
    expect(tokenize('*not a headline').all()).toMatchSnapshot()
    expect(tokenize(' * not a headline').all()).toMatchSnapshot()
    expect(tokenize('*_* not a headline').all()).toMatchSnapshot()
    expect(tokenize('not a headline').all()).toMatchSnapshot()
  })

})
