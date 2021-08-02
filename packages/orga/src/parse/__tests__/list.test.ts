import { parse } from './utils'

it('could handle unordered list', () => {
  expect(
    parse(
      `
- apple
- banana
- orange
`.trim()
    )
  ).toMatchSnapshot()
})

it('could handle ordered list', () => {
  expect(
    parse(
      `
1. apple
5. banana
- orange
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle nested list', () => {
  expect(
    parse(
      `
1. apple
- iPhone
- Mac
5. banana
- orange
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle multi line list item', () => {
  expect(
    parse(
      `
- Apple is an American multinational technology company headquartered in
Cupertino, California that designs, develops, and sells consumer electronics,
computer software, and online services.
- Orange
- Banana
`.trim()
    )
  ).toMatchSnapshot()
})

it('could handle list broken by empty line', () => {
  expect(
    parse(
      `
- Apple is an American multinational technology company headquartered in
  Cupertino, California that designs, develops, and sells consumer electronics,

  computer software, and online services.
- Orange
- Banana
`.trim()
    )
  ).toMatchSnapshot()
})

it('could handle list broken by indent', () => {
  expect(
    parse(
      `
- Apple is an American multinational technology company headquartered in
Cupertino, California that designs, develops, and sells consumer electronics,
  computer software, and online services.
- Orange
- Banana
`.trim()
    )
  ).toMatchSnapshot()
})

it('could handle descriptive list', () => {
  expect(
    parse(
      `
- Apple :: it's apple
- Orange
`.trim()
    )
  ).toMatchSnapshot()

  expect(
    parse(
      `
- Orange
- Apple :: it's apple
`.trim()
    )
  ).toMatchSnapshot()
})
