import { Lexer } from '../tokenize'
import { Token } from '../types'

export default (lexer: Lexer): Token | undefined => {

  const { peek, eat, addInBufferTodoKeywords } = lexer

  const n = peek()

  if (!n || n.type !== 'keyword') return undefined


  if (!n.data || typeof n.data.key !== 'string' || typeof n.data.value !== 'string') {
    throw Error('need key value for keyword')
  }
  const { key, value } = n.data

  if (key.toLowerCase() === 'todo') {
    addInBufferTodoKeywords(value)
  }

  // console.log('keyword:', n)

  return eat()

}
