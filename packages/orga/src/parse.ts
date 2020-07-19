import { Lexer } from './lexer'
import { newNode, push, Node } from './node'
import { inspect } from 'util'

export const parse = ({ next, peek }: Lexer) => {
  const tree = newNode('document')

  const collect = (stop: (n: Token) => boolean) => (container: Node): Node => {
    const token = peek()
    if (!token || stop(token)) return container
    next()
    push(container)(token)
    return collect(stop)(container)
  }

  const paragraph = (
    p: Node = newNode('paragraph'),
    { eolCount }: { eolCount: number } = { eolCount: 0 })
  : Node | null => {
    const token = peek()
    if (!token || eolCount >= 2) {
      if (p.children.length === 0) return null
      return p
    }
    if (token.type === 'newline') {
      next()
      return paragraph(p, { eolCount: eolCount + 1 })
    }

    if (token.type.startsWith('text.')) {
      push(p)(token)
      next()
      return paragraph(p)
    }
    return p
  }

  const skip = (predicate: (token: Token) => boolean): void => {
    const token = peek()
    if (token && predicate(token)) {
      next()
      skip(predicate)
      return
    }
    return
  }

  const parseHeadline = (headline: Node = newNode('headline')): Node => {
    const a = push(headline)

    const token = peek()
    if (!token) return headline
    if (token.type === 'newline') {
      next()
      return headline
    }

    if (['stars', 'keyword', 'priority'].includes(token.type)) {
      headline.data = { ...headline.data, ...token.data }
      a(token)
      next()
      return parseHeadline(headline)
    }

    const content = collect(t => !t.type.startsWith('text.'))(newNode('content'))
    if (content.children.length > 0) {
      a(content)
      return parseHeadline(headline)
    }

    next()
    return parseHeadline(headline)
  }

  const parsePlanning = (section: Node): Node => {
    const token = peek()
    if (!token || token.type !== 'planning.keyword') return section
    const planning = newNode('planning')
    const collect = push(planning)
    collect(token)
    next()
    const timestamp = peek()
    if (timestamp && timestamp.type === 'planning.timestamp') {
      collect(timestamp)
      next()
    }

    push(section)(planning)
    return parsePlanning(section)
  }

  const parseSection = (section: Node): Node => {
    const token = peek()
    if (!token) return section
    if (!section.data) {
      const headline = parseHeadline()
      section.data = { level: headline.data.level }
      push(section)(headline)
      parsePlanning(section)
      return parseSection(section)
    }

    if (token.type === 'stars') {
      if (token.data.level > section.data.level) {
        push(section)(parseSection(newNode('section')))
        return parseSection(section)
      } else {
        return section
      }
    }

    if (token.type.startsWith('text.')) {
      const p = paragraph()
      if (p) {
        push(section)(p)
        return parseSection(section)
      }
    }

    // skip(t => t.type === 'newline')
    // push(section)(token)
    next()

    return parseSection(section)
  }

  const main = () => {
    const token = peek()
    if (!token) return
    if (token.type === 'stars') {
      push(tree)(parseSection(newNode('section')))
      main()
      return
    }

    // lose the token
    console.log('discard', { token: token.type })
    next()

    main()
  }

  main()

  return tree
}
