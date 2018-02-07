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

[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
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

  it('can handle nested headlines', () => {
    const content = `
* #HEADLINE# 1
Paragraph
** #HEADLINE# 1.1
*** #HEADLINE# 1.1.1
content

** #HEADLINE# 1.2
* #HEADLINE# 2
** #HEADLINE# 2.2
`
    expect(parser.parse(content)).toMatchSnapshot()

  })

  it('can handle unordered list', () => {
    const content = `
- apple
- banana
- orange
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle ordered list', () => {
    const content = `
1. apple
5. banana
- orange
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle nested list', () => {
    const content = `
1. apple
  - iPhone
  - Mac
5. banana
- orange
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle table', () => {
    const content = `
| Name         | Species    | Gender | Role         |
|--------------+------------+--------+--------------|
| Bruce Wayne  | Human      | M      | Batman       |
| Clark Kent   | Kryptonian | M      | Superman     |
| Diana Prince | Amazonian  | F      | Wonder Woman |
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle html export', () => {
    const content = `#+HTML: <h1>Hello</h1>`
    expect(parser.parse(content)).toMatchSnapshot()
  })
  it('can handle html export block', () => {
    const content = `
#+BEGIN_EXPORT html
<h1>hello</h1>
<p>world!</p>
#+END_EXPORT
`
    expect(parser.parse(content)).toMatchSnapshot()
  })
})
