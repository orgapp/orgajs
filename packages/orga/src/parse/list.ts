import { Action, Handler, not } from '.'
import { ListItem, ListItemBullet, ListItemTag } from '../types'
import { isPhrasingContent } from '../utils'
import phrasingContent from './phrasing'

const listItem: Action = (token: ListItemBullet, { enter, consume }) => {
  const item: ListItem = enter({
    type: 'list.item',
    indent: token.indent,
    children: [],
  })
  consume()

  let eolCount = 0

  return {
    name: 'list item',
    rules: [
      {
        test: not('newline'),
        action: () => {
          eolCount = 0
          return 'next'
        },
      },
      {
        test: 'newline',
        action: (_, { exit, consume }) => {
          eolCount += 1
          if (eolCount > 1) {
            exit(item.type)
            return 'break'
          }
          consume()
        },
      },
      {
        test: 'list.item.tag',
        action: (token: ListItemTag, { consume }) => {
          item.tag = token.value
          consume()
        },
      },
      {
        test: 'list.item.checkbox',
        action: (_, { consume }) => {
          consume()
        },
      },
      { test: isPhrasingContent, action: phrasingContent },
      {
        test: /.*/,
        action: (_, { exit }) => {
          exit('list.item')
          return 'break'
        },
      },
    ],
  }
}

const list: Action = (token: ListItemBullet, context) => {
  context.enter({
    type: 'list',
    indent: token.indent,
    ordered: token.ordered,
    children: [],
    attributes: {},
  })

  const indent = token.indent

  const handler: Handler = {
    name: 'list',
    rules: [
      {
        test: 'stars',
        action: (_, { exit }) => {
          exit('list')
          return 'break'
        },
      },
      {
        test: 'newline',
        action: (_, { exit, lexer }) => {
          exit('list')
          return 'break'
        },
      },
      {
        test: 'list.item.bullet',
        action: (token: ListItemBullet, context) => {
          const { exit } = context

          if (indent > token.indent) {
            exit('list')
            return 'break'
          } else if (indent === token.indent) {
            return listItem(token, context)
          } else {
            return list(token, context)
          }
        },
      },
    ],
  }

  return handler
}

export default list
