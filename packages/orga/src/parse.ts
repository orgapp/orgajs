import { Lexer } from './lexer'
import { newNode, push, Node } from './node'
import { map } from './position'
import { inspect } from 'util'

export const parse = ({ next, peek }: Lexer) => {
  const tree = newNode('document')

  const parseHeadline = (): Node => {
    const headline = newNode('headline')
    const a = push(headline)
    let token: Token | undefined

    while ((token = peek()) != null) {
      if (['stars', 'keyword', 'priority'].includes(token.name)) {
        a(token)
        next()
      } else {
        break
      }
    }

    return headline
  }

  const parseSection = (): Node => {
    console.log('parseSection')
    const section = newNode('section')
    push(section)(parseHeadline())
    return section
  }

  const main = () => {
    const token = peek()
    if (!token) return
    if (token.name === 'stars') {
      push(tree)(parseSection())
    }

    // lose the token
    console.log('discard', { token: token.name })
    next()

    main()
  }

  main()

  return tree
}
