import { Lexer } from '../lexer'
import { newNode, Node, push } from '../node'
import headline from './headline'
import paragraph from './paragraph'
import planning from './planning'

export default (lexer: Lexer): Node => {

  const { peek, next } = lexer

  const parse = (section: Node): Node => {
    const token = peek()
    if (!token) return section
    if (!section.data) {
      const h = headline(lexer)
      section.data = { level: h.data.level }
      push(section)(h)
      const plannings = planning(lexer)
      plannings.forEach(push(section))
      return parse(section)
    }

    if (token.type === 'stars') {
      if (token.data.level > section.data.level) {
        push(section)(parse(newNode('section')))
        return parse(section)
      } else {
        return section
      }
    }

    if (token.type.startsWith('text.')) {
      const p = paragraph(lexer)
      if (p) {
        push(section)(p)
        return parse(section)
      }
    }

    // skip(t => t.type === 'newline')
    // push(section)(token)
    next()

    return parse(section)
  }

  return parse(newNode('section'))
}
