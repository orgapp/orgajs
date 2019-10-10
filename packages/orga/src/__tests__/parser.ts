import Parser from '../parser'

describe('Parser', () => {
  const parser = new Parser({ todos: ['TODO', 'DONE'], timezone: 'Pacific/Auckland' })
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

  it('can handle timestamp after headline', () => {
    const content = `
* headline
<2019-08-19 Mon>--<2019-08-20 Tue>

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

  it('can handle multi line list item', () => {
    const legit = `
- Apple is an American multinational technology company headquartered in
  Cupertino, California that designs, develops, and sells consumer electronics,
  computer software, and online services.
- Orange
- Banana
`
    expect(parser.parse(legit)).toMatchSnapshot()
  })

  it('can handle broken multi line list item', () => {
    const brokenByEmptyLine = `
- Apple is an American multinational technology company headquartered in
  Cupertino, California that designs, develops, and sells consumer electronics,

  computer software, and online services.
- Orange
- Banana
`
    expect(parser.parse(brokenByEmptyLine)).toMatchSnapshot()

    const brokenByIndent = `
- Apple is an American multinational technology company headquartered in
Cupertino, California that designs, develops, and sells consumer electronics,
  computer software, and online services.
- Orange
- Banana
`
    expect(parser.parse(brokenByIndent)).toMatchSnapshot()
  })


  it('can handle descriptive list', () => {
    const descriptive = `
- Apple :: it's apple
- Orange
`
    expect(parser.parse(descriptive)).toMatchSnapshot()

    const normal = `
- Orange
- Apple :: it's apple
`
    expect(parser.parse(normal)).toMatchSnapshot()
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

  it('can handle table with inline style', () => {
    const content = `
| Name           | Species      | Gender | Role         |
|----------------+--------------+--------+--------------|
| *Bruce Wayne*  | +Bat+ Human  | M      | [[https://en.wikipedia.org/wiki/Batman][Batman]]       |
| _Clark Kent_   | =Kryptonian= | M      | [[https://en.wikipedia.org/wiki/Superman][Superman]]     |
| /Diana Prince/ | ~Amazonian~  | F      | [[https://en.wikipedia.org/wiki/Wonder_Woman][Wonder Woman]] |
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

  it('can handle affiliated keywords', () => {
    const content = `
#+NAME: code_block
#+BEGIN_SRC javascript
console.log('hello world.')
#+END_SRC
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle invalid affiliated keywords', () => {
    const content1 = `
#+NAME: code_block

#+BEGIN_SRC javascript
console.log('hello world.')
#+END_SRC
`
    expect(parser.parse(content1)).toMatchSnapshot()

    const content2 = `
#+NOP: code_block
#+BEGIN_SRC javascript
console.log('hello world.')
#+END_SRC
`
    expect(parser.parse(content2)).toMatchSnapshot()
  })

  it('can handle paragraph', () => {
    const content = `
this is line one.
this is line two.
this is line three.
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle footnote', () => {
    const content = `
[fn:1] Content of the footnote.
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle multi line footnote', () => {
    const content = `
[fn:1] Content of the footnote.
And here is *another* line.
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle complex footnote', () => {
    const content = `
[fn:1] Content of the footnote.
#+BEGIN_SRC javascript
console.log('footnote with code block')
#+END_SRC
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('knows when headline can stop footnote', () => {
    const content = `
[fn:1] Content of the footnote.
And here is another line.
* A Headline
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('knows when footnote can stop footnote', () => {
    const content = `
[fn:1] Content of the footnote.
And here is another line.
[fn:2] another footnote.
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('knows when empty lines can stop footnote', () => {
    const content = `
[fn:1] Content of the footnote.
And here is another line.

still belongs to fn:1


This is not.
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle TODO keywords', () => {
    const content = `
#+TODO: TODO NEXT | DONE

* NEXT Some Headline
`
    expect(parser.parse(content)).toMatchSnapshot()
  })

  it('can handle multiple TODO keywords', () => {
    const content = `
#+TODO: TODO NEXT | DONE
#+TODO: DRAFT PUBLISHED
#+TODO: BUG FEATURE | DONE

* DRAFT Some Headline
`
    expect(parser.parse(content)).toMatchSnapshot()
  })
})
