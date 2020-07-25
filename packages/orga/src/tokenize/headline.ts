import { isEmpty } from '../position'
import { Reader } from '../reader'
import { TodoKeywordSet } from '../todo-keyword-set'
import { Token } from '../types'
import { tokenize } from './inline'

interface Props {
  reader: Reader;
  todoKeywordSets: TodoKeywordSet[];
}

export default ({ reader, todoKeywordSets }: Props) : Token[] => {

  const {
    match,
    skipWhitespaces,
    now,
    eol,
    distance,
    eat,
    jump,
    substring,
  } = reader

  // TODO: cache this, for performance sake
  const todos = todoKeywordSets.flatMap(s => s.keywords)

  const isActionable = (keyword: string): boolean => {
    return !!todoKeywordSets.find(s => s.actionables.includes(keyword))
  }

  let buffer: Token[] = []
  const stars = eat(/^\*+(?=\s)/)
  if (isEmpty(stars)) throw Error('not gonna happen')
  buffer.push({
    type: 'stars',
    level: distance(stars),
    data: { level: distance(stars) },
    position: stars,
  })
  skipWhitespaces()
  const keyword = eat(RegExp(`^${todos.map(escape).join('|')}(?=\\s)`))
  if (!isEmpty(keyword)) {
    const value = substring(keyword)
    buffer.push({
      type: 'todo',
      keyword: value,
      actionable: isActionable(value),
      position: keyword,
    })
  }
  skipWhitespaces()
  const priority = eat(/^\[#(A|B|C)\](?=\s)/)
  if (!isEmpty(priority)) {
    buffer.push({
      type: 'priority',
      value: substring(priority),
      position: priority,
    })
  }

  skipWhitespaces()

  const tags = match(/\s+(:(?:[\w@]+:)+)[ \t]*$/gm)
  let contentEnd = eol()
  if (tags) {
    contentEnd = tags.position.start
  }

  const tokens = tokenize({ reader, end: contentEnd })

  buffer = buffer.concat(tokens)


  if (tags) {
    skipWhitespaces()
    const tagsPosition = { start: now(), end: tags.position.end }
    const s = substring(tagsPosition)
    buffer.push({
      type: 'tags',
      tags: s.split(':'),
      position: { start: now(), end: tags.position.end },
    })
    jump(tags.position.end)
  }
  eat('line')
  return buffer
}
