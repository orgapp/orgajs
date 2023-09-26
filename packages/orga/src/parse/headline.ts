import { Action } from './index.js'
import { Headline, Priority, Stars, Tags, Todo } from '../types.js'
import { isPhrasingContent } from '../utils.js'
import phrasingContent from './phrasing.js'

const headline: Action = (token: Stars, context) => {
  const { enter } = context

  const headline: Headline = enter({
    type: 'headline',
    actionable: false,
    children: [],
    level: token.level || context.level,
  })

  return {
    name: 'headline',
    rules: [
      {
        test: ['newline', 'EOF'],
        action: (_, { exit, discard }) => {
          discard()
          exit(headline.type)
          return 'break'
        },
      },
      {
        test: 'todo',
        action: (token: Todo) => {
          headline.keyword = token.keyword
          headline.actionable = token.actionable
          return 'next'
        },
      },
      {
        test: 'tags',
        action: (token: Tags) => {
          headline.tags = token.tags
          return 'next'
        },
      },
      {
        test: 'priority',
        action: (token: Priority) => {
          headline.priority = token.value
          return 'next'
        },
      },
      {
        test: isPhrasingContent,
        action: phrasingContent,
      },
      {
        test: /.*/,
        action: (_, { push, lexer }) => {
          push(lexer.eat())
        },
      },
    ],
  }
}

export default headline
