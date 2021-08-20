import { Action, Handler, not } from '.'
import { FootnoteInlineBegin, Token } from '../types'
import { clone, isPhrasingContent } from '../utils'
import content from './content'

const isWhitespaces = (node: Token) => {
  return (
    (node.type === 'text' && node.value.trim().length === 0) ||
    node.type === 'newline'
  )
}

const footnote: Action = (token: FootnoteInlineBegin, { enter, lexer }) => {
  enter({
    type: 'footnote.reference',
    label: token.label,
    children: [],
  })
  lexer.eat()

  return {
    name: 'footnote',
    rules: [
      {
        test: 'footnote.inline.begin',
        action: (token, context) => {
          return footnote(token, context)
        },
      },
      {
        test: 'footnote.reference.end',
        action: (_, { push, lexer, exit }) => {
          push(lexer.eat())
          exit('footnote.reference')
          return 'break'
        },
      },
      {
        test: /.*/,
        action: (token, { restore, lexer }) => {
          restore()
        },
      },
    ],
  }
}

const paragraph: Action = (
  _,
  { save, enter, restore, exit, exitTo, attributes }
): Handler => {
  save()
  let eolCount = 0
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
        test: 'newline',
        action: (_, { consume }) => {
          eolCount += 1
          if (eolCount >= 2) {
            finish()
            return 'break'
          }
          consume()
        },
      },
      {
        test: not('newline'),
        action: () => {
          eolCount = 0
          return 'next'
        },
      },
      {
        test: isPhrasingContent,
        action: content,
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
