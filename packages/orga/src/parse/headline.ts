import { Action } from '.'
import { Headline, Priority, Stars, Tags, Todo } from '../types'
import { isPhrasingContent } from '../utils'

const headline: Action = (token: Stars, context) => {
  const { enter } = context

  const headline: Headline = enter({
    type: 'headline',
    actionable: false,
    content: '',
    children: [],
    level: token.level || context.level,
  })

  return {
    name: 'headline',
    rules: [
      {
        test: 'newline',
        action: (_, { push, exit, lexer }) => {
          push(lexer.eat())
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
        action: (token) => {
          headline.content += `${token.value}`
          return 'next'
        },
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
