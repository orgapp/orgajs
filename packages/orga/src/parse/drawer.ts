import { Position } from 'unist'
import { Drawer } from '../types'
import { Lexer } from '../tokenize'
import * as ast from './utils';

export default (lexer: Lexer): Drawer | undefined => {

  const { peek, eat, substring } = lexer

  const begin = peek()

  if (!begin || begin.type !== 'drawer.begin') return undefined

  const drawer = ast.drawer(begin.name, '', {
    position: begin.position,
  });
  eat()

  const content = peek();
  if (content === undefined) {
    return undefined;
  }
  const contentPosition: Position = content.position;

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
