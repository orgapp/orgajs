import { Handler } from '.'
import {
  Closing,
  FootnoteLabel,
  isFootnoteReference,
  isLink,
  LinkPath,
  Opening,
} from '../types.js'

const phrasingContent: Handler = {
  name: 'inline',
  rules: [
    {
      test: 'opening',
      action: (token: Opening, { enter, consume }) => {
        enter({
          type: token.element,
          children: [],
        })
        consume()
      },
    },
    {
      test: 'closing',
      action: (token: Closing, { exit, consume }) => {
        consume()
        exit(token.element)
      },
    },
    {
      test: 'link.path',
      action: (token: LinkPath, context) => {
        const { parent, consume, attributes } = context
        if (!isLink(parent)) {
          throw new Error('expect parent to be link')
        }
        parent.path = {
          protocol: token.protocol,
          value: token.value,
          search: token.search,
        }
        parent.attributes = attributes
        context.attributes = {}
        consume()
      },
    },
    {
      test: 'footnote.label',
      action: (token: FootnoteLabel, { parent, consume }) => {
        if (!isFootnoteReference(parent)) {
          throw new Error('expect parent to be footnote reference')
        }
        parent.label = token.label
        consume()
      },
    },
    {
      test: 'text',
      action: (_, { consume }) => {
        consume()
      },
    },
  ],
}

export default phrasingContent
