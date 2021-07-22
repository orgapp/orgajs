import { newNode, push } from '../node'
import { inspect } from 'util'
import { tokenize } from '../lexer'

// const debug = (text: string) => {
//   const { substring } = map(text)
//   const tokens = tokenize(text)
//   tokens.forEach(token => {
//     console.log({
//       ...token,
//       content: substring(token.position) })
//   })
// }

describe('Node', () => {
  it('works', () => {
    const content = `
* headline
#+BEGIN_SRC javascript
console.log('hello')
console.log('world')
#+END_SRC
`

    const { all } = tokenize(content)

    const tokens = all()

    const tree = newNode('root')
    const add = push(tree)

    tokens.forEach(add)

    console.log(inspect(tree, false, null, true))
  })
})
