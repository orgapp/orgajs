import { Lexer } from '../tokenize'
import { newNode, push, Node } from '../node'

export default ({ peek, eat }: Lexer): Node | null => {
  let eolCount = 0

  const build = (p: Node): Node | null => {
    const token = peek()
    if (!token || eolCount >= 2) {
      if (p.children.length === 0) return null
      return p
    }
    if (token.type === 'newline') {
      eat()
      eolCount += 1
      return build(p)
    }

    if (token.type.startsWith('text.')) {
      push(p)(token)
      eat()
      return build(p)
    }
    return p
  }

  return build(newNode('paragraph'))

}
