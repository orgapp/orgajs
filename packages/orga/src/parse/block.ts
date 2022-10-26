import { Action, Handler } from '.'
import { BlockBegin, BlockEnd } from '../types'

const block: Action = (begin: BlockBegin, context): Handler => {
  context.save()
  const contentStart = begin.position.end
  const blockName = begin.name.toLowerCase()

  const block = context.enter({
    type: 'block',
    name: begin.name,
    params: begin.params,
    value: '',
    attributes: { ...context.attributes },
    children: [],
  })
  context.push(context.lexer.eat())

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
        action: (token: BlockEnd, context) => {
          if (token.name.toLowerCase() !== blockName) return 'next'
          block.value = align(
            context.lexer.substring({
              start: contentStart,
              end: token.position.start,
            })
          )
          context.push(context.lexer.eat())
          context.lexer.eat('newline')
          context.exit('block')
          return 'break'
        },
      },
      {
        test: ['stars', 'EOF'],
        action: (_, context) => {
          context.restore()
          context.lexer.modify((t) => ({
            type: 'text',
            value: context.lexer.substring(t.position),
            position: t.position,
          }))
          return 'break'
        },
      },
      { test: /./, action: (_, context) => context.push(context.lexer.eat()) },
    ],
  }
}

export default block
