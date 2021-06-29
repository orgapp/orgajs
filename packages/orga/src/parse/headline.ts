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

    if (token.type === 'todo') {
      headline.keyword = token.keyword
      headline.actionable = token.actionable
    }

    if ('value' in token && token.value) {
      headline.content += token.value
    }

    if (token.type === 'tags') {
      headline.tags = token.tags
    }

    a(token)
    eat()
    return parse(headline)
  }

  return parse({
    type: 'headline',
    actionable: false,
    content: '',
    children: [], level: -1 })
}
