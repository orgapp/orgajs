import { Lexer } from '../lexer'
import { newNode, push, Node } from '../node'
import { inspect } from 'util'
import parseList from './list'
import section from './section'

export const parse = (lexer: Lexer) => {
  const { next, peek } = lexer
  const tree = newNode('document')

  const main = () => {
    const token = peek()
    if (!token) return
    if (token.type === 'stars') {
      push(tree)(section(lexer))
      main()
      return
    }

    if (token.type === 'list.item.bullet') {
      const list = parseList(lexer)
      push(tree)(list)
    }

    // lose the token
    console.log('discard', { token: token.type })
    next()

    main()
  }

  main()

  return tree
}
