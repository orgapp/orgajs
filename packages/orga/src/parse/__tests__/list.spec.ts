import debug from './debug'

describe('Parse List', () => {
  it('works', () => {
    const content = `
- fruit
  1. apple :: Apple Inc. is an American multinational technology company headquartered in Cupertino, California, that designs, develops, and sells consumer electronics, computer software, and online services.
  2. Raspberry Pi :: The Raspberry Pi is a series of small single-board computers developed in the United Kingdom by the Raspberry Pi Foundation to promote teaching of basic computer science in schools and in developing countries.
- vegetable
- soup
`
    debug(content)
  })
})
