import { Action } from '.'
import { Keyword, Primitive } from '../types'
import parseSymbols from './_parseSymbols'
import _primitive from './_primitive'

const AFFILIATED_KEYWORDS = ['caption', 'header', 'name', 'plot', 'results']

const keyword: Action = (token: Keyword, context) => {
  const { push, lexer } = context
  const key = token.key.toLowerCase()
  const { value } = token

  if (AFFILIATED_KEYWORDS.includes(key)) {
    context.attributes[key] = _primitive(value)
  } else if (key.startsWith('attr_')) {
    context.attributes[key] = {
      ...(context.attributes[key] as { [key: string]: Primitive }),
      ...parseSymbols(value),
    }
  } else if (key === 'todo') {
    lexer.addInBufferTodoKeywords(value)
  } else if (key === 'html') {
    push({ type: 'html', value })
  } else if (context.parent.type === 'document') {
    context.parent.properties[key] = value
  }

  lexer.eat()
}

export default keyword

// export default (context: Context) => {
//   const { push, lexer } = context
//   const token = lexer.peek()
//   if (token.type !== 'keyword') return

//   lexer.eat()
// }
