import { newNode, push } from '../node'
import { Lexer } from '../tokenize'
import { Parent } from '../types'

export default (lexer: Lexer): Parent | undefined => {

  const { peek, eat } = lexer

  const n = peek()

  if (!n || n.type !== 'block.begin') return undefined

  const block = newNode('block')
  block.data = { ...n.data }
  const a = push(block)
  a(n)
  eat()

  const parse = (): Parent | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    a(n)
    eat()
    if (n.type === 'block.end') {
      eat('newline')
      return block
    } else {
      return parse()
    }
  }

  return parse()
}
