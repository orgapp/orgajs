import { Action } from '.'
import { DrawerBegin, Section } from '../types'

const drawer: Action = (begin: DrawerBegin, context) => {
  context.save()
  const drawer = context.enter({
    type: 'drawer',
    name: begin.name,
    value: '',
    children: [],
  })
  context.push(context.lexer.eat())

  const contentStart = begin.position.end

  return {
    name: 'drawer',
    rules: [
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
      {
        test: 'drawer.end',
        action: (token, context) => {
          context.push(context.lexer.eat())
          drawer.value = context.lexer.substring({
            start: contentStart,
            end: token.position.start,
          })

          context.exit('drawer')
          context.lexer.eat('newline')

          if (drawer.name.toLowerCase() === 'properties') {
            const section = context.parent as Section
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
