import { tokenize } from '../index'

describe('tokenize list item', () => {

  it('knows list items', () => {

    // unordered
    expect(tokenize('- buy milk').all()).toMatchSnapshot()
    expect(tokenize('+ buy milk').all()).toMatchSnapshot()
    // ordered
    expect(tokenize('1. buy milk').all()).toMatchSnapshot()
    expect(tokenize('12. buy milk').all()).toMatchSnapshot()
    expect(tokenize('123) buy milk').all()).toMatchSnapshot()
    // checkbox
    expect(tokenize('- [x] buy milk checked').all()).toMatchSnapshot()
    expect(tokenize('- [X] buy milk checked').all()).toMatchSnapshot()
    expect(tokenize('- [-] buy milk checked').all()).toMatchSnapshot()
    expect(tokenize('- [ ] buy milk unchecked').all()).toMatchSnapshot()
    // indent
    expect(tokenize('  - buy milk').all()).toMatchSnapshot()
    // tag
    expect(tokenize('- item1 :: description here').all()).toMatchSnapshot()
    expect(tokenize('- item2\n :: description here').all()).toMatchSnapshot()
    expect(tokenize('- [x] item3 :: description here').all()).toMatchSnapshot()
  })

  it('knows these are not list items', () => {
    expect(tokenize('-not item').all()).toMatchSnapshot()
    expect(tokenize('1.not item').all()).toMatchSnapshot()
    expect(tokenize('8)not item').all()).toMatchSnapshot()
    expect(tokenize('8a) not item').all()).toMatchSnapshot()
  })

})
