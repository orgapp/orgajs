import { Action } from './index.js'
import { Opening, isParagraph, PhrasingContent } from '../types.js'
import { clone, isPhrasingContent } from '../utils.js'
import { Context } from './context.js'
import phrasingContent from './phrasing.js'
import { isImage } from './_utils.js'

const isWhitespaces = (node: PhrasingContent) => {
  return (
    (node.type === 'text' && node.value.trim().length === 0) ||
    node.type === 'newline' ||
    node.type === 'emptyLine'
  )
}

const paragraph: Action = () => {
  const makeSureParagraph = (context: Context) => {
    const parent = context.parent
    if (parent.type === 'paragraph') return
    context.save()
    context.enter({
      type: 'paragraph',
      children: [],
      attributes: clone(context.attributes),
    })
    context.attributes = {}
  }

  const exitPragraph = (context: Context) => {
    const paragraph = context.parent
    if (!isParagraph(paragraph)) return
    if (
      paragraph.children.length === 0 ||
      paragraph.children.every(isWhitespaces)
    ) {
      context.restore()
    } else {
      // TODO: should we do this?
      // exitTo('paragraph')
      context.exit('paragraph')
    }
  }

  return {
    name: 'paragraph',
    rules: [
      {
        test: 'emptyLine',
        action: (_, context) => {
          context.consume()
          exitPragraph(context)
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
        test: 'opening',
        action: (token: Opening, context) => {
          if (token.element === 'link') {
            const next = context.lexer.peek(1)
            if (next.type === 'link.path' && isImage(next.value)) {
              exitPragraph(context)
              return phrasingContent
            }
          }
          makeSureParagraph(context)
          return phrasingContent
        },
      },
      {
        test: isPhrasingContent,
        action: (_, context) => {
          makeSureParagraph(context)
          return phrasingContent
        },
      },
      // catch all
      {
        test: /.*/,
        action: (_, context) => {
          exitPragraph(context)
          return 'break'
        },
      },
    ],
  }
}

export default paragraph
