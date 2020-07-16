import { tokenize } from '../inline'
import { Reader } from '../reader'
import { isEmpty } from '../position'

interface Props {
  reader: Reader;
  todoKeywords: string[];
}

export default ({ reader, todoKeywords }: Props) : Token[] => {

  const {
    match,
    skipWhitespaces,
    getLine,
    substring,
    now,
    distance,
    eat,
    jump,
  } = reader


  let buffer: Token[] = []
  const stars = eat(/^\*+(?=\s)/)
  if (isEmpty(stars)) throw Error('not gonna happen')
  buffer.push({
    name: 'stars',
    data: { level: distance(stars) },
    position: stars,
  })
  skipWhitespaces()
  const keyword = eat(RegExp(`^${todoKeywords.map(escape).join('|')}(?=\\s)`))
  if (!isEmpty(keyword)) {
    buffer.push({
      name: 'keyword',
      position: keyword,
    })
  }
  skipWhitespaces()
  const priority = eat(/^\[#(A|B|C)\](?=\s)/)
  if (!isEmpty(priority)) {
    buffer.push({
      name: 'priority',
      position: priority,
    })
  }

  skipWhitespaces()
  let content = getLine()

  const tags = match(/\s+(:(?:[\w@]+:)+)[ \t]*$/gm)
  if (tags) {
    content = substring({ start: now(), end: tags.position.start }) as string
  }

  if (content.length === 0) return buffer
  const tokens = tokenize(content, now())

  buffer = buffer.concat(tokens)

  eat(content.length)

  if (tags) {
    skipWhitespaces()
    buffer.push({
      name: 'tags',
      position: { start: now(), end: tags.position.end },
    })
    jump(tags.position.end)
  }
  eat('line')
  return buffer
}
