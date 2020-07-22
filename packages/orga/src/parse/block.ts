import { Lexer } from '../tokenize'
import { newNode, push, Node } from '../node'

export default (lexer: Lexer): Node | undefined => {

  const { peek, eat } = lexer

  const n = peek()

  if (!n || n.type !== 'block.begin') return undefined

  const block = newNode('block')
  block.data = { ...n.data }
  const a = push(block)
  a(n)
  eat()

  const parse = (): Node | undefined => {
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
