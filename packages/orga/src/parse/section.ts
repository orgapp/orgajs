import { push } from '../node'
import { Lexer } from '../tokenize'
import { Attributed, Attributes, Document, Footnote, Primitive, Section } from '../types'
import parseBlock from './block'
import parseDrawer from './drawer'
import parseHeadline from './headline'
import parseList from './list'
import parseParagraph from './paragraph'
import parsePlanning from './planning'
import parseTable from './table'
import utils from './utils'
import parseSymbols from './_parseSymbols'
import _primitive from './_primitive'

const AFFILIATED_KEYWORDS = [ 'caption', 'header', 'name', 'plot', 'results' ]

const attach = (attributes: Attributes) => (node: Attributed) => {
  if (Object.keys(attributes).length === 0) return
  node.attributes = { ...node.attributes, ...attributes }
}

export default (lexer: Lexer) => <T extends Document | Section>(root: T): T => {

  const { peek, eat, eatAll, modify, substring } = lexer
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

    while (tryTo(parseDrawer)(drawer => {
      if (drawer.name.toLowerCase() === 'properties') {
        section.properties = drawer.value.split('\n').reduce((accu, current) => {
          const m = current.match(/\s*:(.+?):\s*(.+)\s*$/)
          if (m) {
            return { ...accu, [m[1].toLowerCase()]: m[2] }
          }
          return accu
        }, section.properties)
      }
      push(section)(drawer)
    })) continue

    const token = peek();
    if (token && ((token.type === 'drawer.begin' && token.name.toLowerCase() === 'properties') || token.type === 'drawer.end')) {
      // we encountered an unclosed property drawer (or a drawer with no beginning), so this should just be treated as text
      modify(t => ({ ...t, type: 'text.plain', value: substring(token.position) }));
    }
    return section
  }

  const parse = <T extends Document | Section | Footnote>(section: T, attributes: Attributes = {}): T => {

    if (eatAll('newline') > 1) {
      attributes = {} // reset affliated keywords
    }

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

    // keyword
    if (token.type === 'keyword') {
      const key = token.key.toLowerCase()
      const { value } = token

      if (AFFILIATED_KEYWORDS.includes(key)) {
        attributes[key] = _primitive(value)
      } else if (key.startsWith('attr_')) {
        attributes[key] = {
          ...attributes[key] as { [key: string]: Primitive },
          ...parseSymbols(value),
        }

      } else if (key === 'todo') {
        lexer.addInBufferTodoKeywords(value)
      } else if (key === 'html') {
        push(section)({ type: 'html', value })
      } else if (section.type === 'document') {
        section.properties[key] = value
      }

      eat()
      return parse(section, attributes)
    }

    // list
    if (tryTo(parseList)(attach(attributes), push(section))) {
      return parse(section)
    }

    // table
    if (tryTo(parseTable)(attach(attributes), push(section))) {
      return parse(section)
    }

    // block
    if (tryTo(parseBlock)(attach(attributes), push(section))) {
      return parse(section)
    }

    // unclosed block or a block end without a beginning - treated as text
    if (token.type === 'block.begin' || token.type === 'block.end') {
      modify(t => ({ ...t, type: 'text.plain', value: substring(token.position) }));
    }

    if (token.type === 'hr') {
      push(section)(token)
    }

    // paragraph
    if (tryTo(parseParagraph)(attach(attributes), push(section))) {
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
