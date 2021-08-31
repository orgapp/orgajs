import { Action } from '.'
import { DrawerBegin, Section } from '../types'

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
      {
        test: 'drawer.end',
        action: (token, { lexer, push, getParent }) => {
          push(lexer.eat())
          drawer.value = lexer.substring({
            start: contentStart,
            end: token.position.start,
          })

          exit('drawer')
          eat('newline')

          if (drawer.name.toLowerCase() === 'properties') {
            const section = getParent() as Section
            section.properties = drawer.value
              .split('\n')
              .reduce((accu, current) => {
                const m = current.match(/\s*:(.+?):\s*(.+)\s*$/)
                if (m) {
                  return { ...accu, [m[1].toLowerCase()]: m[2] }
                }
                return accu
              }, section.properties)
          }
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
