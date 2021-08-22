import assert from 'assert'
import { Handler } from '.'
import { Closing, FootnoteLabel, LinkPath, Opening } from '../types'

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
      action: (token: LinkPath, { parent, consume }) => {
        assert(parent.type === 'link', 'expect parent to be link')
        parent.path = {
          protocol: token.protocol,
          value: token.value,
          search: token.search,
        }
        consume()
      },
    },
    {
      test: 'footnote.label',
      action: (token: FootnoteLabel, { parent, consume }) => {
        assert(
          parent.type === 'footnote.reference',
          'expect parent to be footnote.reference'
        )
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
