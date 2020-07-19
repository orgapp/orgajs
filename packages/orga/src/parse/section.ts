import { Lexer } from '../lexer'
import { newNode, Node, push, level } from '../node'
import headline from './headline'
import paragraph from './paragraph'
import planning from './planning'
import list from './list'

export default (lexer: Lexer) => (root: Node): Node => {

  const { peek, next } = lexer

  const newSection = (): Node => {
    const section = newNode('section')
    const h = headline(lexer)
    push(section)(h)
    const plannings = planning(lexer)
    plannings.forEach(push(section))
    return section
  }

  const parse = (section: Node): Node => {
    const token = peek()
    if (!token) return section

    // section
    if (token.type === 'stars') {
      console.log({ section: section })
      if (section.type === 'document' || token.data.level > level(section)) {
        const ns = newSection()
        push(section)(parse(ns))
        return parse(section)
      } else {
        return section
      }
    }

    // paragraph
    if (token.type.startsWith('text.')) {
      const p = paragraph(lexer)
      if (p) {
        push(section)(p)
        return parse(section)
      }
    }

    // list
    if (token.type === 'list.item.bullet') {
      push(section)(list(lexer))
      return parse(section)
    }

    // skip(t => t.type === 'newline')
    // push(section)(token)
    next()

    return parse(section)
  }

  parse(root)
  return root
}
