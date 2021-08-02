import { parse } from './utils'

it('can parse normal drawer', () => {
  expect(
    parse(
      `
* headline
:PROPERTIES:
key1: value 1
key2: value 2
:END:
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle broken drawer (without end)', () => {
  expect(
    parse(
      `
* headline
:PROPERTIES:
key: value
key: value

Paragraph
`.trim()
    )
  ).toMatchSnapshot()
})
