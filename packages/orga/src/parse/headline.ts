import { newNode, push } from '../node'
import { Lexer } from '../tokenize'
import { Parent } from '../types'
import utils from './utils'

export default (lexer: Lexer): Parent => {

  const { peek, eat } = lexer
  const { collect } = utils(lexer)

  const parse = (headline: Parent): Parent => {
    const a = push(headline)

    const token = peek()
    if (!token) return headline
    if (token.type === 'newline') {
      push(headline)(token)
      eat()
      return headline
    }

    if (['stars', 'keyword', 'priority'].includes(token.type)) {
      headline.data = { ...headline.data, ...token.data }
      a(token)
      eat()
      return parse(headline)
    }

    const content = collect(t => !t.type.startsWith('text.'))(newNode('content'))
    if (content.children.length > 0) {
      a(content)
      return parse(headline)
    }

    eat()
    return parse(headline)
  }

  return parse(newNode('headline'))
}
