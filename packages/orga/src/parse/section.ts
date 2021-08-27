import { Action } from '.'
import { Stars } from '../types'
import drawer from './drawer'
import headline from './headline'
import planning from './planning'

const section: Action = (token: Stars, context) => {
  const { enter, exit, exitTo } = context

  // stars break footnote
  exit('footnote', false)

  const level = token.level

  if (level <= context.level) {
    exitTo('section')
    exit('section')
    return
  }

  enter({
    type: 'section',
    level: level,
    properties: {},
    children: [],
  })

  let headlineProcessed = false

  return {
    name: 'section',
    rules: [
      {
        test: 'stars',
        action: (token: Stars, context) => {
          if (headlineProcessed) return 'break'
          headlineProcessed = true
          return headline(token, context)
        },
      },
      {
        test: 'planning.keyword',
        action: planning,
      },
      {
        test: 'drawer.begin',
        action: drawer,
      },
    ],
  }
}

export default section
