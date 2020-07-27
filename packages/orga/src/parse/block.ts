import { push } from '../node'
import { Lexer } from '../tokenize'
import { Block } from '../types'

export default (lexer: Lexer): Block | undefined => {

  const { peek, eat } = lexer

  const n = peek()

  if (!n || n.type !== 'block.begin') return undefined

  const block: Block = { type: 'block', params: n.params, children: [] }
  const a = push(block)
  a(n)
  eat()

  const parse = (): Block | undefined => {
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
