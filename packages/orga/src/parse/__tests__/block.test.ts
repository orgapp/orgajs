import { parse } from './utils'

it('should parse normal block', () => {
  expect(
    parse(
      `
#+BEGIN_SRC javascript
console.log('hello')
console.log('world')
#+END_SRC
`.trim()
    )
  ).toMatchSnapshot()
})

it('should handle broken blocks (missing end)', () => {
  expect(
    parse(
      `
#+BEGIN_SRC javascript
console.log('hello')
console.log('world')
`.trim()
    )
  ).toMatchSnapshot()
})

it('should handle broken blocks (missing begin)', () => {
  expect(
    parse(
      `
console.log('hello')
console.log('world')
#+END_SRC
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle html export', () => {
  expect(
    parse(
      `
#+BEGIN_EXPORT html
<h1>hello</h1>
<p>world!</p>
#+END_EXPORT
`.trim()
    )
  ).toMatchSnapshot()

  expect(
    parse(
      `
#+HTML: <h1>Hello</h1>
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle affiliated keywords', () => {
  expect(
    parse(
      `
#+NAME: code_block
#+BEGIN_SRC javascript
console.log('hello world.')
#+END_SRC
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle invalid affiliated keywords', () => {
  expect(
    parse(
      `
#+NAME: code_block

#+BEGIN_SRC javascript
console.log('hello world.')
#+END_SRC
`.trim()
    )
  ).toMatchSnapshot()

  expect(
    parse(
      `
#+NOP: code_block
#+BEGIN_SRC javascript
console.log('hello world.')
#+END_SRC
`.trim()
    )
  ).toMatchSnapshot()
})
