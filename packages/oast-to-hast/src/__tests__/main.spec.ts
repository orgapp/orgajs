import u from 'unist-builder'
import { inspect } from 'util'
import { parse } from 'orga'
import { toHAST } from '../'

describe('Main', () => {
  it('works', () => {
    const text = `
* hello world
this is a test
** some headline
`

    const tree = parse(text)
    const hast = toHAST(tree)
    console.log(inspect(hast, false, null, true))
  })
})
