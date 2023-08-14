import { Action } from './index.js'
import { Stars } from '../types.js'
import drawer from './drawer.js'
import headline from './headline.js'
import planning from './planning.js'

const section: Action = (token: Stars, context) => {
  const {
    enter,
    exit,
    exitTo,
    options: { flat },
  } = context

  // stars break footnote
  exit('footnote', false)

  if (!flat) {
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
  }

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
