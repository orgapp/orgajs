import { Action } from '.'
import { DrawerBegin } from '../types'

const drawer: Action = (begin: DrawerBegin, context) => {
  const { save, enter, push, exit, lexer } = context
  const { eat } = lexer
  save()
  const drawer = enter({
    type: 'drawer',
    name: begin.name,
    value: '',
    children: [],
  })
  push(eat())

  const contentStart = begin.position.end

  return {
    name: 'drawer',
    rules: [
      {
        test: 'stars',
        action: (_, { restore, lexer }) => {
          restore()
          lexer.modify((t) => ({
            type: 'text.plain',
            value: lexer.substring(t.position),
            position: t.position,
          }))
          return 'break'
        },
      },
      {
        test: 'drawer.end',
        action: (token, { lexer, push }) => {
          push(lexer.eat())
          drawer.value = lexer.substring({
            start: contentStart,
            end: token.position.start,
          })
          exit('drawer')
          eat('newline')
          return 'break'
        },
      },
      {
        test: /.*/,
        action: (_, { consume }) => consume(),
      },
    ],
  }
}

export default drawer
