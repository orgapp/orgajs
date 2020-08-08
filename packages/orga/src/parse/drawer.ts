import { Position } from 'unist'
import { Drawer } from '../types'
import { Lexer } from '../tokenize'

export default (lexer: Lexer): Drawer | undefined => {

  const { peek, eat, substring } = lexer

  const begin = peek()

  if (!begin || begin.type !== 'drawer.begin') return undefined

  const drawer: Drawer = {
    type: 'drawer',
    name: begin.name,
    position: begin.position,
    value: '' }
  eat()

  const contentPosition: Position = peek().position

  const parse = (): Drawer | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    eat()
    if (n.type === 'drawer.end') {
      contentPosition.end = n.position.start
      eat('newline')
      drawer.value = substring(contentPosition).trim()
      drawer.position.end = n.position.end
      return drawer
    } else {
      return parse()
    }
  }

  return parse()
}
