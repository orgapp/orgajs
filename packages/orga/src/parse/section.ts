import { push } from '../node'
import { Lexer } from '../tokenize'
import { Document, Footnote, Section } from '../types'
import parseBlock from './block'
import parseDrawer from './drawer'
import parseHeadline from './headline'
import parseList from './list'
import parseParagraph from './paragraph'
import parsePlanning from './planning'
import parseTable from './table'
import utils from './utils'

export default (lexer: Lexer) => <T extends Document | Section>(root: T): T => {

  const { peek, eat } = lexer
  const { tryTo } = utils(lexer)

  const newSection = (props: { [key: string]: string } = {}): Section => {
    const headline = parseHeadline(lexer)
    const section: Section = {
      type: 'section',
      level: headline.level,
      properties: { ...props },
      children: [],
    }
    push(section)(headline)
    const plannings = parsePlanning(lexer)
    plannings.forEach(push(section))

    while (tryTo(parseDrawer, drawer => {
      if (drawer.name.toLowerCase() === 'properties') {
        section.properties = drawer.value.split('\n').reduce((accu, current) => {
          const m = current.match(/\s*:(.+):\s*(.+)\s*$/)
          if (m) {
            return { ...accu, [m[1].toLowerCase()]: m[2] }
          }
          return accu
        }, section.properties)
      }
      push(section)(drawer)
    })) continue
    return section
  }

  const parse = <T extends Document | Section | Footnote>(section: T): T => {

    const token = peek()
    if (!token) return section

    // section
    if (token.type === 'stars') {
      if (section.type === 'document' ||
        (section.type === 'section' && token.level > section.level)) {
        const ns = newSection(section.properties as { [key: string]: string; })
        push(section)(parse(ns))
        return parse(section)
      }
      return section
    }

    // list
    if (tryTo(parseList, push(section))) {
      return parse(section)
    }

    // table
    if (tryTo(parseTable, push(section))) {
      return parse(section)
    }

    // block
    if (tryTo(parseBlock, push(section))) {
      return parse(section)
    }

    // keyword
    if (token.type === 'keyword') {

      const { key, value } = token
      switch (key.toLowerCase()) {
        case 'todo':
          lexer.addInBufferTodoKeywords(value)
          break
        case 'html':
          push(section)({ type: 'html', value })
          break
        default:
          if (section.type === 'document') {
            section.properties[key.toLowerCase()] = value
          }
          break
      }

      eat()
      return parse(section)
    }

    if (token.type === 'hr') {
      push(section)(token)
    }

    // paragraph
    if (tryTo(parseParagraph, push(section))) {
      return parse(section)
    }

    if (token.type === 'footnote.label') {
      // footnote breaks sections
      if (section.type !== 'document') return section
      const footnote: Footnote = {
        type: 'footnote',
        label: token.label,
        children: [],
      }
      eat()
      push(section)(parse(footnote))
      return parse(section)
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
