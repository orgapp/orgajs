import { Lexer } from '../tokenize'
import { newNode, Node, push, level } from '../node'
import headline from './headline'
import paragraph from './paragraph'
import planning from './planning'
import parseDrawer from './drawer'
import list from './list'
import utils from './utils'

export default (lexer: Lexer) => (root: Node): Node => {

  const { peek, eat } = lexer
  const { tryTo } = utils(lexer)

  const newSection = (): Node => {
    const section = newNode('section')
    const h = headline(lexer)
    push(section)(h)
    const plannings = planning(lexer)
    plannings.forEach(push(section))

    let drawer: Node | undefined
    while ((drawer = tryTo(parseDrawer)) != null) {
      push(section)(drawer)
    }

    return section
  }

  const parse = (section: Node): Node => {
    const token = peek()
    if (!token) return section

    // section
    if (token.type === 'stars') {
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
    eat()

    return parse(section)
  }

  parse(root)
  return root
}
