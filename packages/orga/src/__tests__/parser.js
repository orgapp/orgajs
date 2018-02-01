const Parser = require('../parser')

describe('Parser', () => {
  let parser = new Parser()
  it('works', () => {
    const content = `
#+TITLE: hello world
#+TODO: TODO NEXT | DONE
#+DATE: 2018-01-01

* NEXT headline one
DEADLINE: <2018-01-01 Mon>
:PROPERTIES:
key: value
key: value
:END:

[[https://github.com/xiaoxinghu/OrgMarker/releases][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...
`
    const document = parser.parse(content)
    expect(document).toMatchSnapshot()
  })

  it(`can handle blocks`, () => {
    const content = `
* headline
#+BEGIN_SRC javascript
console.log('hello')
console.log('world')
#+END_SRC
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it(`can handle broken blocks`, () => {
    const endLess = `
* headline
#+BEGIN_SRC javascript
console.log('hello')
console.log('world')
`
    expect(parser.parse(endLess)).toMatchSnapshot()

    const beginLess = `
* headline
console.log('hello')
console.log('world')
#+END_SRC
`
    expect(parser.parse(beginLess)).toMatchSnapshot()
  })

  it('can handle drawers', () => {
    const content = `
* headline
:PROPERTIES:
key1: value 1
key2: value 2
:END:
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle broken drawers', () => {
    const content = `
* headline
:PROPERTIES:
key: value
key: value

Paragraph
`
    expect(parser.parse(content)).toMatchSnapshot()
  })
})
