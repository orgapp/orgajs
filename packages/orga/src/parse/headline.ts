import { push } from '../node'
import { Lexer } from '../tokenize'
import { Headline } from '../types'

export default (lexer: Lexer): Headline => {

  const { peek, eat } = lexer

  const parse = (headline: Headline): Headline => {
    const a = push(headline)

    const token = peek()
    if (!token) return headline
    if (token.type === 'newline') {
      push(headline)(token)
      eat()
      return headline
    }

    if (token.type === 'stars') {
      headline.level = token.level
    }

    if (['stars', 'keyword', 'priority'].includes(token.type)) {
      a(token)
      eat()
      return parse(headline)
    }

    a(token)
    eat()
    return parse(headline)
  }

  return parse({ type: 'headline', children: [], level: -1 })
}
