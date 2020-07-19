import { Lexer } from '../lexer'
import { Node, push } from '../node'

export default ({ peek, next }: Lexer) => {
  const collect = (stop: (n: Token) => boolean) => (container: Node): Node => {
    const token = peek()
    if (!token || stop(token)) return container
    next()
    push(container)(token)
    return collect(stop)(container)
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

  return {
    collect,
    skip,
  }
}
