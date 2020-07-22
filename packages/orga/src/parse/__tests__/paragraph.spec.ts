import { tokenize } from '../../tokenize'
import { parse } from '../index'
import debug from './debug'

describe('Parse Paragraph', () => {
  it('works', () => {
//     const content = `
// #+TITLE: hello world
// #+TODO: TODO NEXT | DONE
// #+DATE: 2018-01-01

// * TODO [#A] headline one
// DEADLINE: <2018-01-01 Mon>
// :PROPERTIES:
// key: value
// key: value
// :END:
// :LOGS:
// log: hello world
// :END:

// [[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
// the round pegs in the +round+ square holes...

// * DONE level1 headline :tag1:tag2:
// some content
// ** level 2 headline
// some other content
// `

    const content = `
* DONE level1 headline :tag1:tag2:

[[https://github.com/xiaoxinghu/orgajs][Here's]] some content
hello world

another paragraph here
** level 2 headline
some other content
`
    // const thing = parse(tokenize(content))
    const lexer = tokenize(content)

    const tree = parse(lexer)

    expect(tree).toMatchSnapshot()
    // debug(content)
  })
})
