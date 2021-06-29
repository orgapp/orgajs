import { tokenize } from '../../tokenize'
import { parse } from '../index'

describe('Parse Paragraph', () => {
  it('works', () => {
    const content = `
#+ATTR_HTML: :style background: black;
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...

#+ATTR_HTML: :width 300
[[file:logo.png]]
`

    //     const content = `
    // [[https://github.com/xiaoxinghu/orgajs][Here's]] some /content/ hello world.
    // `
    expect(parse(tokenize(content))).toMatchSnapshot()
    // debug(content)
  })
})
