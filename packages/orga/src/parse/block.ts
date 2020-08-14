import { Position } from 'unist'
import { Block } from '../types'
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
  let contentStart = begin.position.end
  const nl = eat('newline')
  if (nl) {
    contentStart = nl.position.end
  }
  eat('newline')

  const range: Position = {
    start: contentStart,
    end: begin.position.end,
  }

  /*
   * find the indentation of the block and apply it to
   * the rest of the block.
   *
   * The indentation of the first non-blank line is used as standard.
   * The following lines use the lesser one between its own
   * indentation and the standard. Leading and trailing blank lines
   * are omitted.
   */
  const align = (content: string) => {
    let indent = -1
    return content.trimRight().split('\n').map(line => {
      const _indent = line.search(/\S/)
      if (indent === -1) {
        indent = _indent
      }
      if (indent === -1) return ''
      return line.substring(Math.min(_indent, indent))
    }).join('\n')
  }

  const parse = (): Block | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    eat()
    if (n.type === 'block.end' && n.name.toLowerCase() === begin.name.toLowerCase()) {
      range.end = n.position.start
      eat('newline')
      block.value = align(substring(range))
      block.position.end = n.position.end
      return block
    }
    return parse()
  }

  return parse()
}
