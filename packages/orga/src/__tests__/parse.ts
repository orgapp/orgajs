import { parse } from '../parse'
import { tokenize } from '../lexer'
import { map } from '../position'
import { inspect } from 'util'

const debug = (text: string, tree) => {
  console.log(inspect(tree, false, null, true))
}

describe('Parser', () => {
  it('works', () => {
    const content = `
#+TITLE: hello world
#+TODO: TODO NEXT | DONE
#+DATE: 2018-01-01

* TODO [#A] headline one
DEADLINE: <2018-01-01 Mon>
:PROPERTIES:
key: value
key: value
:END:

[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...
`
    // const thing = parse(tokenize(content))
    const lexer = tokenize(content)

    const tree = parse(lexer)
    debug(content, tree)
    // debug(content, thing)
  })
})
