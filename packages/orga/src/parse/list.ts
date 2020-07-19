import { Lexer } from '../lexer'
import { newNode, push, Node } from '../node'
import utils from './utils'

export default (lexer: Lexer): Node => {

  let eolCount = 0
  const { peek, next } = lexer
  const { collect } = utils(lexer)

  const parse = (list: Node): Node => {
    const token = peek()
    if (!token || eolCount > 1) return list
    if (token.type === 'newline') {
      next()
      eolCount += 1
      return parse(list)
    }

    eolCount = 0

    if (token.type === 'list.item.bullet') {
      if (!list.data) {
        list.data = token.data
      } else if (list.data.indent > token.data.indent) {
        return list
      } else if (list.data.indent < token.data.indent) {
        push(list)(parse(newNode('list')))
      } else {
        const li = collect(t => t.type === 'newline')(newNode('list.item'))
        push(list)(li)
      }
    }

    return parse(list)

    // push(list)(li)
  }

  return parse(newNode('list'))

}
