import { isEmpty } from '../position'
import { Reader } from '../reader'
import { TodoKeywordSet } from '../todo-keyword-set'
import { Token } from './types'
import { tokenize } from './inline'
import {
  tokPriority,
  tokStars,
  tokTags,
  tokTodo
} from './util';

interface Props {
  reader: Reader;
  todoKeywordSets: TodoKeywordSet[];
}

export default ({ reader, todoKeywordSets }: Props): Token[] => {

  const {
    match,
    now,
    eol,
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
  if (isEmpty(stars.position)) throw Error('not gonna happen')
  buffer.push(tokStars(stars.value.length, { position: stars.position }));

  eat('whitespaces')
  const keyword = eat(RegExp(`^${todos.map(escape).join('|')}`))
  if (!isEmpty(keyword.position)) {
    buffer.push(tokTodo(keyword.value, isActionable(keyword.value), { position: keyword.position }));
  }
  eat('whitespaces')
  const priority = eat(/^\[#(.)\]/)
  if (!isEmpty(priority.position)) {
    const { value, ...rest } = priority;
    buffer.push(tokPriority(value.charAt(2), rest));
  }

  eat('whitespaces')

  const tags = match(/\s+(:(?:[\w@_#%-]+:)+)[ \t]*$/gm)
  let contentEnd = eol()
  if (tags) {
    contentEnd = tags.position.start
  }

  const tokens = tokenize({ reader, end: contentEnd })

  buffer = buffer.concat(tokens)


  if (tags) {
    eat('whitespaces')
    const tagsPosition = { start: now(), end: tags.position.end }
    const s = substring(tagsPosition)
    buffer.push(tokTags(s.split(':').map(t => t.trim()).filter(Boolean), {
      position: { start: now(), end: tags.position.end },
    }));
    jump(tags.position.end)
  }
  return buffer
}
