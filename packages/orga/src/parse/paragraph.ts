import { push } from '../node'
import { Paragraph } from '../types'
import { isPhrasingContent } from '../utils'

const parseParagraph = ({ peek, eat }): Paragraph | undefined => {
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
      push(p)(token)
      eat()
      return build(p)
    }
    return p.children.length === 0 ? undefined : p
  }

  return build({ type: 'paragraph', children: [] })

}

export default parseParagraph
