import { newNode, push } from '../node'
import { Lexer } from '../tokenize'
import { Headline } from '../types'
import { isPhrasingContent } from '../utils'
import utils from './utils'

export default (lexer: Lexer): Headline => {

  const { peek, eat } = lexer
  const { collect } = utils(lexer)

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
      headline.data = { ...headline.data, ...token.data }
      a(token)
      eat()
      return parse(headline)
    }

    const content = collect(isPhrasingContent)(newNode('content'))
    if (content.children.length > 0) {
      a(content)
      return parse(headline)
    }

    eat()
    return parse(headline)
  }

  return parse({ type: 'headline', children: [], level: -1 })
}
