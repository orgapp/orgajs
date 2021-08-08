import { Action } from '.'
import { FootnoteLabel } from '../types'

const Footnote: Action = (token: FootnoteLabel, { enter, exitTo, consume }) => {
  exitTo('document')
  enter({
    type: 'footnote',
    label: token.label,
    children: [],
  })
  consume()
}

export default Footnote
