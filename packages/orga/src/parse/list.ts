import { newNode, push } from '../node'
import { Lexer } from '../tokenize'
import { Parent } from '../types'
import utils from './utils'

export default (lexer: Lexer): Parent | undefined => {
  const { match, peek, eat } = lexer

  if (!match('list.item.bullet')) return undefined

  let eolCount = 0
  const { collect } = utils(lexer)

  const parse = (list: Parent): Parent => {
    const token = peek()
    if (!token || eolCount > 1) return list
    if (token.type === 'newline') {
      eat()
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
