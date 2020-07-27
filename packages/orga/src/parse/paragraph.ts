import { push } from '../node'
import { Paragraph, Parent } from '../types'
import { isPhrasingContent } from '../utils'
import { Parse } from './'

const parseParagraph: Parse = ({ peek, eat }): Parent | undefined => {
  let eolCount = 0

  const build = (p: Paragraph): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= 2) {
      return p.children.length === 0 ? undefined : p
    }
    if (token.type === 'newline') {
      eat()
      eolCount += 1
      return build(p)
    }

    if (isPhrasingContent(token)) {
      push(p as Parent)(token)
      eat()
      return build(p)
    }
    return p.children.length === 0 ? undefined : p
  }

  return build({ type: 'paragraph', children: [] }) as Parent

}

export default parseParagraph
