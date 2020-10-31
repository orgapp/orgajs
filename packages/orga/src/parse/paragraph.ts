import { push } from '../node'
import { Paragraph } from '../types'
import { isPhrasingContent } from '../utils'

const isWhitespaces = node => {
  return node.type === 'text.plain' && node.value.trim().length === 0
}

export default ({ peek, eat }): Paragraph | undefined => {
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

    if (token.type === 'newline') {
      eat()
      eolCount += 1
      p = p || createParagraph()
      push(p)({ type: 'text.plain', value: ' ', position: token.position })
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
