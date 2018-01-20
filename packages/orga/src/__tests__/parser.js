const Parser = require('../parser')

describe('Parser', () => {
  it('works', () => {
    const parser = new Parser({ todos: ['TODO', 'DONE'] })

    const content = `#+TITLE: hello world\n* headline one`
    const document = parser.parse(content)
    expect(document).toMatchSnapshot()
  })
})
