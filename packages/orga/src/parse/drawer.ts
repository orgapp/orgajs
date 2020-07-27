import { push } from '../node'
import { Lexer } from '../tokenize'
import { Drawer } from '../types'

export default (lexer: Lexer): Drawer | undefined => {

  const { peek, eat } = lexer

  const n = peek()

  if (!n || n.type !== 'drawer.begin') return undefined

  const drawer: Drawer = { type: 'drawer', name: n.name, children: [] }
  const a = push(drawer)
  a(n)
  eat()

  const parse = (): Drawer | undefined => {
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
