import { Lexer } from '../tokenize'
import { Node, push } from '../node'

export default (lexer: Lexer) => {
  const { peek, eat, save, restore } = lexer
  const collect = (stop: (n: Token) => boolean) => (container: Node): Node => {
    const token = peek()
    if (!token || stop(token)) return container
    eat()
    push(container)(token)
    return collect(stop)(container)
  }

  const skip = (predicate: (token: Token) => boolean): void => {
    const token = peek()
    if (token && predicate(token)) {
      eat()
      skip(predicate)
      return
    }
    return
  }

  const tryTo = (parse: (lexer: Lexer) => Node | undefined): Node | undefined => {
    const savePoint = save()
    const n = parse(lexer)
    if (!n) restore(savePoint)
    return n
  }

  return {
    collect,
    skip,
    tryTo,
  }
}
