import { level, newNode, Node, push } from '../node'
import { Lexer } from '../tokenize'
import parseBlock from './block'
import parseDrawer from './drawer'
import parseHeadline from './headline'
import parseList from './list'
import parseParagraph from './paragraph'
import parsePlanning from './planning'
import parseKeyword from './keyword'
import utils from './utils'

export default (lexer: Lexer) => (root: Node): Node => {

  const { peek, eat } = lexer
  const { tryTo } = utils(lexer)

  const newSection = (): Node => {
    const section = newNode('section')
    const h = parseHeadline(lexer)
    push(section)(h)
    const plannings = parsePlanning(lexer)
    plannings.forEach(push(section))

    while (tryTo(parseDrawer)(section)) continue
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
    if (tryTo(parseParagraph)(section)) {
      return parse(section)
    }

    // list
    if (tryTo(parseList)(section)) {
      return parse(section)
    }

    // block
    if (tryTo(parseBlock)(section)) {
      return parse(section)
    }

    // keyword
    if (tryTo(parseKeyword)(section)) {
      return parse(section)
    }

    if (token.type == 'hr') {
      push(section)(token)
    }

    // skip(t => t.type === 'newline')
    // push(section)(token)
    // console.log(`skip: ${token.type}`)
    eat()

    return parse(section)
  }

  parse(root)
  return root
}
