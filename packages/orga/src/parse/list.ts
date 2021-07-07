import { push } from '../node'
import { Lexer } from '../tokenize'
import { List, ListItem } from '../types'
import { ListItemBullet } from '../tokenize/types'

export default (lexer: Lexer): List | undefined => {
  const { peek, eat } = lexer

  const token = peek()
  if (!token || token.type !== 'list.item.bullet') return undefined

  let eolCount = 0

  const newList = (token: ListItemBullet): List => ({
    type: 'list',
    indent: token.indent,
    ordered: token.ordered,
    children: [],
    attributes: {},
  })

  const parseListItem = (listItem: ListItem): ListItem => {
    const token = peek()
    if (!token || token.type === 'newline')
      return listItem

    if (token.type === 'list.item.tag') {
      listItem.tag = token.value
    } else {
      push(listItem)(token)
    }

    eat()
    return parseListItem(listItem)
  }

  const parse = (list: List): List => {
    const token = peek()
    if (!token || token.type === 'stars' || eolCount > 1) return list
    if (token.type === 'newline') {
      eat()
      eolCount += 1
      return parse(list)
    }

    eolCount = 0

    if (token.type !== 'list.item.bullet' || list.indent > token.indent) {
        return list
    }
    if (list.indent < token.indent) {
      push(list)({
        type: 'list.item',
        indent: token.indent,
        children: [parse(newList(token))]
      });
    } else {
      const li = parseListItem({
        type: 'list.item',
        indent: token.indent,
        children: [] })
      push(list)(li)
    }
    return parse(list)
  }

  return parse(newList(token))

}
