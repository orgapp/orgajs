import { Lexer } from '../tokenize'
import { Keyword } from '../../types'

export default (lexer: Lexer): Keyword | undefined => {

  const { peek, eat, addInBufferTodoKeywords } = lexer

  const n = peek()

  if (!n || n.type !== 'keyword') return undefined

  if (n.key.toLowerCase() === 'todo') {
    addInBufferTodoKeywords(n.value)
  }

  // console.log('keyword:', n)

  eat()
  return undefined

}
