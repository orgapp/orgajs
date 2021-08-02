import { parse } from './utils'

it('can handle footnote', () => {
  expect(
    parse(
      `
[fn:1] Content of the footnote.
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle multi line footnote', () => {
  expect(
    parse(
      `
[fn:1] Content of the footnote.
And here is *another* line.
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle complex footnote', () => {
  expect(
    parse(
      `
[fn:1] Content of the footnote.
#+BEGIN_SRC javascript
console.log('footnote with code block')
#+END_SRC
`.trim()
    )
  ).toMatchSnapshot()
})

it('knows when headline can stop footnote', () => {
  expect(
    parse(
      `
[fn:1] Content of the footnote.
And here is another line.
* A Headline
`.trim()
    )
  ).toMatchSnapshot()
})

it('knows when footnote can stop footnote', () => {
  expect(
    parse(
      `
[fn:1] Content of the footnote.
And here is another line.
[fn:2] another footnote.
`.trim()
    )
  ).toMatchSnapshot()
})

it('knows when empty lines can stop footnote', () => {
  expect(
    parse(
      `
[fn:1] Content of the footnote.
And here is another line.

still belongs to fn:1


This is not.
`.trim()
    )
  ).toMatchSnapshot()
})
