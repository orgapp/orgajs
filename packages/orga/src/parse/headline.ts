import { Lexer } from '../lexer'
import { newNode, Node, push } from '../node'
import utils from './utils'

export default (lexer: Lexer): Node => {

  const { peek, next } = lexer
  const { collect } = utils(lexer)

  const parse = (headline: Node): Node => {
    const a = push(headline)


    const token = peek()
    if (!token) return headline
    if (token.type === 'newline') {
      next()
      return headline
    }

    if (['stars', 'keyword', 'priority'].includes(token.type)) {
      headline.data = { ...headline.data, ...token.data }
      a(token)
      next()
      return parse(headline)
    }

    const content = collect(t => !t.type.startsWith('text.'))(newNode('content'))
    if (content.children.length > 0) {
      a(content)
      return parse(headline)
    }

    next()
    return parse(headline)
  }

  return parse(newNode('headline'))
}
