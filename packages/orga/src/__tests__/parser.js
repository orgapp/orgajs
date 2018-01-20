const Parser = require('../parser')

describe('Parser', () => {
  it('works', () => {
    const parser = new Parser({ todos: ['TODO', 'DONE'] })

    const content = `
#+TITLE: hello world
* headline one
DEADLINE: <2018-01-01 Mon>
:PROPERTIES:
key: value
key: value
:END:

[[https://github.com/xiaoxinghu/OrgMarker/releases][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...
`
    const document = parser.parse(content)
    expect(document).toMatchSnapshot()
  })
})
