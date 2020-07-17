import Node from '../node'
import uri from '../uri'
import { map, isGreaterThan } from '../position'
import { Reader } from '../reader'


const LINK_PATTERN = /\[\[([^\]]*)\](?:\[([^\]]*)\])?\]/m; // \1 => link, \2 => text
const FOOTNOTE_PATTERN = /\[fn:(\w+)\]/

const PRE = `[\\s\\({'"]|^`
const POST = `[\\s-\\.,:!?'\\)}]|$`
const BORDER = `[^,'"\\s]`

function markup(marker: string) {
  return RegExp(`(?<=(${PRE}))${marker}(${BORDER}(?:.*?(?:${BORDER}))??)${marker}(?=(${POST}.*))`, 'm')
}

const shift = (point: Point, offset: Point) => {
  return {
    line: point.line + offset.line,
    column: point.column + offset.column,
  }
}

const shiftRange = (range: Range, offset: number) => {
  return {
    start: range.start + offset,
    end: range.end + offset,
  }
}

const shiftPosition = (position: Position, offset: Point) => {
  return {
    start: shift(position.start, offset),
    end: shift(position.end, offset),
  }
}

const DEFAULT_TOKEN_NAME = 'text.plain'

interface Props {
  reader: Reader;
  start?: Point;
  end?: Point;
}

export const tokenize = ({ reader, start, end } : Props) => {
  const { now, eol, match, substring } = reader
  const s = start || now()
  const e = end || eol()

  let tokens = [
    { name: DEFAULT_TOKEN_NAME, position: { start: s, end: e } }
  ]

  const parse = (
    name: string,
    pattern: RegExp,
    content: Token[],
    data: (captures: string[]) => any = () => undefined,
  ): Token[] => {

    return content.reduce((all, token) => {
      if (token.name !== DEFAULT_TOKEN_NAME) return all.concat(token)
      const m = match(pattern, token.position)
      if (!m) return all.concat(token)
      if (isGreaterThan(m.position.start, token.position.start)) {
        all.push({ name: DEFAULT_TOKEN_NAME, position: {
          start: token.position.start,
          end: m.position.start,
        } })
      }

      all.push({
        name,
        position: m.position,
        data: data(m.captures),
      })

      if (isGreaterThan(token.position.end, m.position.end)) {
        const rest = parse(name, pattern, [
          {name: DEFAULT_TOKEN_NAME,
          position: {
            start: m.position.end,
            end: token.position.end,
          }}
        ])
        all = all.concat(rest)
      }

      return all
    }, [] as Token[])
  }

  tokens = parse('text.link', LINK_PATTERN, tokens, (captures) => ({
    uri: uri(captures[1]),
    description: captures[2],
  }))

  tokens = parse('text.footnote', FOOTNOTE_PATTERN, tokens, (captures) => ({
    label: captures[1],
  }))

  tokens = parse('text.bold', markup('\\*'), tokens)
  tokens = parse('text.verbatim', markup('='), tokens)
  tokens = parse('text.italic', markup('/'), tokens)
  tokens = parse('text.strikeThrough', markup('\\+'), tokens)
  tokens = parse('text.underline', markup('_'), tokens)
  tokens = parse('text.code', markup('~'), tokens)
  return tokens
}
