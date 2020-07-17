import { tokenize } from './inline'
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
    eol,
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
      name: 'tags',
      position: { start: now(), end: tags.position.end },
    })
    jump(tags.position.end)
  }
  eat('line')
  return buffer
}
