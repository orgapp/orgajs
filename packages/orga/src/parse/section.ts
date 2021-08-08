import { Action, Handler } from '.'
import { Stars } from '../types'
import headline from './headline'
import planning from './planning'
import drawer from './drawer'

const section: Action = (token: Stars, context): Handler => {
  const { enter, exit, exitTo } = context

  exit('footnote')

  if (token.level <= context.level) {
    exitTo('section')
    exit('section')
    return
  }

  enter({
    type: 'section',
    level: token.level,
    properties: {},
    children: [],
  })

  return {
    name: 'section',
    rules: [
      {
        test: 'stars',
        action: (token: Stars, context) => {
          return headline(token, context)
        },
      },
      {
        test: 'planning.keyword',
        action: () => {
          return planning
        },
      },
      {
        test: 'drawer.begin',
        action: (token, context) => {
          return drawer(token, context)
        },
      },
      { test: /.*/, action: () => 'break' },
    ],
  }
}

export default section
