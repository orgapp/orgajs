import { Lexer } from '../tokenize'

export default (lexer: Lexer): Token | undefined => {

  const { peek, eat, addInBufferTodoKeywords } = lexer

  const n = peek()

  if (!n || n.type !== 'keyword') return undefined

  const { key, value } = n.data

  if (key.toLowerCase() === 'todo') {
    addInBufferTodoKeywords(value)
  }

  // console.log('keyword:', n)

  return eat()

}
