import { push } from '../node'
import { Lexer } from '../tokenize'
import { List, ListItem } from '../types'
import { ListItemBullet } from '../tokenize/types'
import * as ast from './utils';

export default (lexer: Lexer): List | undefined => {
  const { peek, eat } = lexer

  const token = peek()
  if (!token || token.type !== 'list.item.bullet') return undefined

  let eolCount = 0

  const newList = (token: ListItemBullet): List =>
    ast.list(token.indent, token.ordered, []);

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
      push(list)(ast.listItem(token.indent, [parse(newList(token))]));
    } else {
      push(list)(parseListItem(ast.listItem(token.indent, [])));
    }
    return parse(list)
  }

  return parse(newList(token))

}
