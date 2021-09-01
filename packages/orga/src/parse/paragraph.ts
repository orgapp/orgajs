import { Action, Handler } from '.'
import { Token } from '../types'
import { clone, isPhrasingContent } from '../utils'
import phrasingContent from './phrasing'

const isWhitespaces = (node: Token) => {
  return (
    (node.type === 'text' && node.value.trim().length === 0) ||
    node.type === 'newline' ||
    node.type === 'emptyLine'
  )
}

const paragraph: Action = (
  _,
  { save, enter, restore, exit, exitTo, attributes }
): Handler => {
  save()
  const paragraph = enter({
    type: 'paragraph',
    children: [],
    attributes: clone(attributes),
  })

  const finish = () => {
    if (
      paragraph.children.length === 0 ||
      paragraph.children.every(isWhitespaces)
    ) {
      restore()
    } else {
      // TODO: should we do this?
      // exitTo('paragraph')
      exit('paragraph')
    }
  }

  return {
    name: 'paragraph',
    rules: [
      {
        test: 'emptyLine',
        action: (_, { consume }) => {
          consume()
          finish()
          return 'break'
        },
      },
      {
        test: 'newline',
        action: (_, { consume }) => {
          consume()
        },
      },
      {
        test: isPhrasingContent,
        action: phrasingContent,
      },
      // catch all
      {
        test: /.*/,
        action: () => {
          finish()
          return 'break'
        },
      },
    ],
  }
}

export default paragraph
