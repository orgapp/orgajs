import { push } from '../node'
import { Lexer } from '../tokenize'
import { List, ListItemBullet } from '../types'
import utils from './utils'

export default (lexer: Lexer): List | undefined => {
  const { peek, eat } = lexer

  const token = peek()
  if (!token || token.type !== 'list.item.bullet') return undefined

  let eolCount = 0
  const { collect } = utils(lexer)

  const newList = (token: ListItemBullet): List => ({
    type: 'list',
    indent: token.indent,
    ordered: token.ordered,
    children: [],
  })

  const parse = (list: List): List => {
    const token = peek()
    if (!token || eolCount > 1) return list
    if (token.type === 'newline') {
      eat()
      eolCount += 1
      return parse(list)
    }

    eolCount = 0

    if (token.type === 'list.item.bullet') {
      if (list.indent > token.indent) {
        return list
      } else if (list.indent < token.indent) {
        push(list)(parse(newList(token)))
      } else {
        const li = collect(t => t.type === 'newline')({
          type: 'list.item',
          children: [],
        })
        push(list)(li)
      }
    }

    return parse(list)
  }

  return parse(newList(token))

}
