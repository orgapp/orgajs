import { Lexer } from './lexer'
import { newNode, push, Node } from './node'
import { inspect } from 'util'

export const parse = ({ next, peek }: Lexer) => {
  const tree = newNode('document')

  const collectContent = (container: Node): Node => {
    const a = push(container)
    const token = peek()
    // if (!token) return container
    // if (token.name === 'newline') return container
    if (!token || !token.name.startsWith('text.')) return container
    a(token)
    next()
    return collectContent(container)
  }

  const parseHeadline = (headline: Node = newNode('headline')): Node => {
    const a = push(headline)

    const token = peek()
    if (!token) return headline
    if (token.name === 'newline') {
      next()
      return headline
    }

    if (['stars', 'keyword', 'priority'].includes(token.name)) {
      a(token)
      next()
      return parseHeadline(headline)
    }

    const content = collectContent(newNode('content'))
    if (content.children.length > 0) {
      a(content)
      return parseHeadline(headline)
    }

    next()
    return parseHeadline(headline)
  }

  const parsePlanning = (section: Node): Node => {
    const token = peek()
    if (!token || token.name !== 'planning.keyword') return section
    const planning = newNode('planning')
    const collect = push(planning)
    collect(token)
    next()
    const timestamp = peek()
    if (timestamp && timestamp.name === 'planning.timestamp') {
      collect(timestamp)
      next()
    }

    push(section)(planning)
    return parsePlanning(section)
  }

  const parseSection = (): Node => {
    const section = newNode('section')
    push(section)(parseHeadline())
    parsePlanning(section)
    return section
  }

  const main = () => {
    const token = peek()
    if (!token) return
    if (token.name === 'stars') {
      push(tree)(parseSection())
    }

    // lose the token
    console.log('discard', { token: token.name })
    next()

    main()
  }

  main()

  return tree
}
