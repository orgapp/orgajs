import { parse } from '../inline'
import Node from '../node'


describe('Inline Parsing', () => {
  it('single emphasis', () => {

    const str = 'hello *world*, welcome to *org-mode*. Have a nice *day*.'
    expect(parse(str)).toMatchSnapshot()
  })
})
