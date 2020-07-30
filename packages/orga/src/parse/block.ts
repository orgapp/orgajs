import { Position } from 'unist'
import { Block } from '../../types'
import { Lexer } from '../tokenize'

export default (lexer: Lexer): Block | undefined => {

  const { peek, eat, substring } = lexer

  const n = peek()

  if (!n || n.type !== 'block.begin') return undefined

  const block: Block = {
    type: 'block',
    name: n.name,
    params: n.params,
    value: '',
  }
  // const a = push(block)
  // a(n)
  eat()

  const range: Position = peek().position

  const parse = (): Block | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    eat()
    if (n.type === 'block.end') {
      range.end = n.position.start
      eat('newline')
      block.value = substring(range).trim()
      return block
    } else {
      return parse()
    }
  }

  return parse()
}
