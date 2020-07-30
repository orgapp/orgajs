import { parse } from 'orga'
import { inspect } from 'util'
import { toHAST } from '../'

describe('Main', () => {
  it('works', () => {
    const text = `
* hello *world*
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
** some headline
`

    const tree = parse(text)
    const hast = toHAST(tree)
    console.log(inspect(hast, false, null, true))
  })
})
