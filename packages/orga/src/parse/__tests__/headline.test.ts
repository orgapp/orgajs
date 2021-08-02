import { parse } from './utils'

it('should handle timestamp after headline', () => {
  expect(
    parse(
      `
* headline
<2019-08-19 Mon>--<2019-08-20 Tue>

Paragraph
`.trim()
    )
  ).toMatchSnapshot()
})

it('should handle nested headlines', () => {
  expect(
    parse(
      `
* #HEADLINE# 1
Paragraph
** #HEADLINE# 1.1
*** #HEADLINE# 1.1.1
content

** #HEADLINE# 1.2
* #HEADLINE# 2
** #HEADLINE# 2.2
`.trim()
    )
  ).toMatchSnapshot()
})
