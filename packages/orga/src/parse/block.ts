import { Position } from 'unist'
import { Block } from '../../types'
import { Lexer } from '../tokenize'

export default (lexer: Lexer): Block | undefined => {

  const { peek, eat, substring } = lexer

  const begin = peek()

  if (!begin || begin.type !== 'block.begin') return undefined

  const block: Block = {
    type: 'block',
    name: begin.name,
    params: begin.params,
    position: begin.position,
    value: '',
  }
  // const a = push(block)
  // a(n)
  eat()

  const range: Position = {
    start: begin.position.end,
    end: begin.position.end,
  }

  const parse = (): Block | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    eat()
    if (n.type === 'block.end' && n.name.toLowerCase() === begin.name.toLowerCase()) {
      range.end = n.position.start
      eat('newline')
      block.value = substring(range).trim()
      block.position.end = n.position.end
      return block
    } else {
      return parse()
    }
  }

  return parse()
}
