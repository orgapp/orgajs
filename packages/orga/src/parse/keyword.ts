import { Action } from './index.js'
import type { HTML, Keyword, Primitive, JSX } from '../types.js'
import parseSymbols from './_parseSymbols.js'
import _primitive from './_primitive.js'

const AFFILIATED_KEYWORDS = ['caption', 'header', 'name', 'plot', 'results']

const keyword: Action = (token: Keyword, context) => {
  const { push, lexer, addProp } = context
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
    push({ type: 'html', value } as HTML)
  } else if (key === 'jsx') {
    push({ type: 'jsx', value } as JSX)
  } else {
    addProp(key, value)
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
