import { Action, Handler } from '.'
import { BlockBegin, BlockEnd } from '../types'

const block: Action = (
  begin: BlockBegin,
  { save, push, enter, lexer, attributes }
): Handler => {
  save()
  const contentStart = begin.position.end
  const blockName = begin.name.toLowerCase()

  const block = enter({
    type: 'block',
    name: begin.name,
    params: begin.params,
    value: '',
    attributes: { ...attributes },
    children: [],
  })
  push(lexer.eat())

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
    return content
      .trimRight()
      .split('\n')
      .map((line) => {
        const _indent = line.search(/\S/)
        if (indent === -1) {
          indent = _indent
        }
        if (indent === -1) return ''
        let result = line.substring(Math.min(_indent, indent))

        // remove escaping char ,
        if (block.name.toLowerCase() === 'src' && block.params[0] === 'org') {
          result = result.replace(/^(\s*),/, '$1')
        }
        return result
      })
      .join('\n')
      .trim()
  }

  return {
    name: 'block',
    rules: [
      {
        test: 'block.end',
        action: (token: BlockEnd, { exit, push, lexer }) => {
          const { eat } = lexer
          if (token.name.toLowerCase() !== blockName) return 'next'
          block.value = align(
            lexer.substring({
              start: contentStart,
              end: token.position.start,
            })
          )
          push(eat())
          eat('newline')
          exit('block')
          return 'break'
        },
      },
      {
        test: ['stars', 'EOF'],
        action: (_, { restore, lexer }) => {
          restore()
          lexer.modify((t) => ({
            type: 'text',
            value: lexer.substring(t.position),
            position: t.position,
          }))
          return 'break'
        },
      },
      { test: /./, action: (_, { push, lexer }) => push(lexer.eat()) },
    ],
  }
}

export default block
