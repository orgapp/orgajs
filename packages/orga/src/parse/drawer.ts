import { Lexer } from '../tokenize'
import { newNode, push, Node } from '../node'

export default (lexer: Lexer): Node | undefined => {

  const { peek, eat } = lexer

  const n = peek()

  if (!n || n.type !== 'drawer.begin') return undefined

  const drawer = newNode('drawer')
  drawer.data = { type: n.data.type }
  const a = push(drawer)
  a(n)
  eat()

  const parse = (): Node | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    a(n)
    eat()
    if (n.type === 'drawer.end') {
      eat('newline')
      return drawer
    } else {
      return parse()
    }
  }

  return parse()
}
