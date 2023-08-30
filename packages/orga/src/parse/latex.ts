import { Action, Handler } from '.'
import { LatexBegin, LatexEnd } from '../types'

const latex: Action = (begin: LatexBegin, context): Handler => {
  context.save()
  const contentStart = begin.position.start
  const envName = begin.name.toLowerCase()

  const latexBlock = context.enter({
    type: 'latex',
    name: begin.name,
    value: '',
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
      .trimEnd()
      .split('\n')
      .map((line) => {
        const _indent = line.search(/\S/)
        if (indent === -1) {
          indent = _indent
        }
        if (indent === -1) return ''
        const result = line.substring(Math.min(_indent, indent))
        return result
      })
      .join('\n')
      .trim()
  }

  return {
    name: 'latex',
    rules: [
      {
        test: 'latex.end',
        action: (token: LatexEnd, context) => {
          if (token.name.toLowerCase() !== envName) return 'next'
          latexBlock.value = align(
            context.lexer.substring({
              start: contentStart,
              end: token.position.end,
            })
          )
          context.push(context.lexer.eat())
          context.lexer.eat('newline')
          context.exit('latex')
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

export default latex
