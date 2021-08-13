import { Action, Handler, not } from '.'
import { push } from '../node'
import { Lexer } from '../tokenize'
import {
  FootnoteInlineBegin,
  FootnoteReference,
  Paragraph,
  PhrasingContent,
  Token,
} from '../types'
import { clone, isPhrasingContent } from '../utils'

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
  { save, enter, restore, exit, attributes }
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
      exit('paragraph')
    }
  }

  return {
    name: 'paragraph',
    rules: [
      {
        test: 'newline',
        action: (_, { push, exit, lexer: { eat } }) => {
          eolCount += 1
          if (eolCount >= 2) {
            finish()
            return 'break'
          }
          return 'next'
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
        action: (_, { push, lexer: { eat } }) => {
          push(eat())
        },
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

const old = (lexer: Lexer): Paragraph | undefined => {
  const { peek, eat } = lexer
  let eolCount = 0

  const createParagraph = (): Paragraph => ({
    type: 'paragraph',
    children: [],
    attributes: {},
  })

  const build = (p: Paragraph = undefined): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= 2) {
      return p
    }

    function readAFootnote(
      par: Paragraph | FootnoteReference = p
    ): PhrasingContent | undefined {
      if (token.type === 'footnote.inline.begin') {
        eat()
        const fn: FootnoteReference = {
          children: [],
          type: 'footnote.reference',
          label: token.label,
        }
        let inner: Token
        while ((inner = peek())) {
          if (inner.type === 'footnote.inline.begin') {
            // nested footnote reference
            readAFootnote(fn)
          } else if (inner.type === 'footnote.reference.end') {
            eat()
            push(par)(fn)
            eolCount = 0
            return fn
          } else if (isPhrasingContent(inner)) {
            eat()
            fn.children.push(inner)
          } else {
            return undefined
          }
        }
      }
    }

    if (readAFootnote()) {
      return build(p)
    }

    if (token.type === 'newline') {
      eat()
      eolCount += 1
      p = p || createParagraph()
      push(p)({ type: 'text', value: ' ', position: token.position })
      return build(p)
    }

    if (isPhrasingContent(token)) {
      p = p || createParagraph()
      push(p)(token)
      eat()
      eolCount = 0
      return build(p)
    }
    return p
  }

  const p = build()
  if (!p) return undefined
  // trim whitespaces
  while (p.children.length > 0) {
    if (isWhitespaces(p.children[p.children.length - 1])) {
      p.children.pop()
      continue
    }
    if (isWhitespaces(p.children[0])) {
      p.children.slice(1)
      continue
    }
    break
  }

  if (p.children.length === 0) {
    return undefined
  }

  return p
}
