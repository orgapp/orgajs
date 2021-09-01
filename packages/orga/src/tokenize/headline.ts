import { Reader } from 'text-kit'
import { TodoKeywordSet } from '../todo-keyword-set'
import { Token } from '../types'
import { tokenize } from './inline'

export default (todoKeywordSets: TodoKeywordSet[]) =>
  (reader: Reader): Token[] | void => {
    const { isStartOfLine, match, now, eol, eat, jump, substring, endOfLine } =
      reader

    if (!isStartOfLine() || !match(/^\*+\s+/my)) return

    // TODO: cache this, for performance sake
    const todos = todoKeywordSets.flatMap((s) => s.keywords)

    const isActionable = (keyword: string): boolean => {
      return !!todoKeywordSets.find((s) => s.actionables.includes(keyword))
    }

    let buffer: Token[] = []

    const stars = eat(/^\*+(?=\s)/)
    if (!stars) throw Error('not gonna happen')
    buffer.push({
      type: 'stars',
      level: stars.value.length,
      position: stars.position,
    })

    eat('whitespaces')
    const keyword = eat(RegExp(`${todos.map(escape).join('|')}(?=\\s)`, 'y'))
    if (keyword) {
      buffer.push({
        type: 'todo',
        keyword: keyword.value,
        actionable: isActionable(keyword.value),
        position: keyword.position,
      })
    }
    eat('whitespaces')
    const priority = eat(/^\[#(A|B|C)\](?=\s)/y)
    if (priority) {
      buffer.push({
        type: 'priority',
        ...priority,
      })
    }

    eat('whitespaces')

    const tags = match(/[ \t]+(:(?:[\w@_#%-]+:)+)[ \t]*$/m, {
      end: endOfLine(),
    })
    let contentEnd = eol(now().line)
    if (tags) {
      contentEnd = tags.position.start
    }

    const r = reader.read({ end: contentEnd })
    const tokens = tokenize(r)
    jump(r.now())

    buffer = buffer.concat(tokens)

    if (tags) {
      eat('whitespaces')
      const tagsPosition = { start: now(), end: tags.position.end }
      const s = substring(tagsPosition.start, tagsPosition.end)
      buffer.push({
        type: 'tags',
        tags: s
          .split(':')
          .map((t) => t.trim())
          .filter(Boolean),
        position: { start: now(), end: tags.position.end },
      })
      jump(tags.position.end)
    }
    return buffer
  }
