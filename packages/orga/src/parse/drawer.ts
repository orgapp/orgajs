import { newNode, push } from '../node'
import { Lexer } from '../tokenize'
import { Parent } from '../types'

export default (lexer: Lexer): Parent | undefined => {

  const { peek, eat } = lexer

  const n = peek()

  if (!n || n.type !== 'drawer.begin') return undefined

  const drawer = newNode('drawer')
  drawer.data = { name: n.name }
  const a = push(drawer)
  a(n)
  eat()

  const parse = (): Parent | undefined => {
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
