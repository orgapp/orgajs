import { tokenize } from './inline'
import { Reader } from '../reader'
import { isEmpty } from '../position'
import { TodoKeywordSet } from '../todo-keyword-set'

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
    data: { level: distance(stars) },
    position: stars,
  })
  skipWhitespaces()
  const keyword = eat(RegExp(`^${todos.map(escape).join('|')}(?=\\s)`))
  if (!isEmpty(keyword)) {
    buffer.push({
      type: 'keyword',
      data: { actionable: isActionable(substring(keyword)) },
      position: keyword,
    })
  }
  skipWhitespaces()
  const priority = eat(/^\[#(A|B|C)\](?=\s)/)
  if (!isEmpty(priority)) {
    buffer.push({
      type: 'priority',
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
    buffer.push({
      type: 'tags',
      position: { start: now(), end: tags.position.end },
    })
    jump(tags.position.end)
  }
  eat('line')
  return buffer
}
