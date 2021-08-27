import { parse } from 'orga'
import toHAST from '../'

const transform = (text) => {
  const oast = parse(text)
  return toHAST(oast)
}

describe('Main', () => {
  it('works', () => {
    const text = `
* hello *world*
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
** some headline
`

    const tree = parse(text)
    const hast = toHAST(tree)
  })

  it('pass properties of oast to hast data field', () => {
    const hast = transform(`
#+TITLE: Hello
#+cover: image/cover.png

* Hi
`)

    expect(hast.data).toMatchInlineSnapshot(`
      Object {
        "cover": "image/cover.png",
        "title": "Hello",
      }
    `)
  })
})
