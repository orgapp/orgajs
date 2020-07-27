import { Node } from 'unist'
import { push } from '../node'
import { Lexer } from '../tokenize'
import { Parent, Token } from '../types'

export default (lexer: Lexer) => {
  const { peek, eat, save, restore } = lexer
  const collect = (stop: (n: Token) => boolean) => (container: Parent): Parent => {
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

  const tryTo = <T extends Node>(
    parse: (lexer: Lexer) => T | undefined,
    action: (node: T) => void,
  ): boolean => {
    const savePoint = save()
    const node = parse(lexer)
    if (!node) {
      restore(savePoint)
      return false
    }
    action(node)
    return true
  }

  return {
    collect,
    skip,
    tryTo,
  }
}
