import { push } from '../node'
import { Paragraph } from '../types'
import { isPhrasingContent } from '../utils'

export default ({ peek, eat }): Paragraph | undefined => {
  let eolCount = 0

  const build = (p: Paragraph = undefined): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= 2) {
      return p
    }

    if (token.type === 'newline') {
      eat()
      eolCount += 1
      p = p || { type: 'paragraph', children: [] }
      push(p)({ type: 'text.plain', value: ' ' })
      return build(p)
    }

    if (isPhrasingContent(token)) {
      p = p || { type: 'paragraph', children: [] }
      push(p)(token)
      eat()
      return build(p)
    }
    return p
  }

  return build()

}
