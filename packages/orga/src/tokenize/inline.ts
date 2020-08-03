import { Point, Position } from 'unist';
import { after } from '../position';
import { Reader } from '../reader';
import { Token, PhrasingContent, StyledText } from '../../types';
import uri from '../uri';


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

const shiftPosition = (position: Position, offset: Point) => {
  return {
    start: shift(position.start, offset),
    end: shift(position.end, offset),
  }
}

interface Props {
  reader: Reader;
  start?: Point;
  end?: Point;
}



export const tokenize = ({ reader, start, end } : Props): Token[] => {
  const { now, eol, match, jump, substring } = reader
  const s = start || now()
  const e = end || eol()

  let tokens: PhrasingContent[] = [
    {
      type: 'text.plain',
      value: substring({ start: s, end: e }),
      position: { start: s, end: e },
    }
  ]

  const parse = <T extends PhrasingContent>(
    type: T['type'],
    pattern: RegExp,
    content: PhrasingContent[],
    build: (match: { captures: string[], position: Position }) => PhrasingContent,
  ): PhrasingContent[] => {

    return content.reduce((all, token) => {
      if (token.type !== 'text.plain') return all.concat(token)
      const m = match(pattern, token.position)
      if (!m) return all.concat(token)
      if (!token.position || !m.position) {
        throw Error('not gonna happen')
      }
      if (after(token.position.start)(m.position.start)) {
        const position = {
          start: token.position.start,
          end: m.position.start,
        }
        all.push({
          type: 'text.plain',
          value: substring(position),
          position,
        })
      }


      all.push(build(m))

      if (after(m.position.end)(token.position.end)) {
        const rest = parse(type, pattern, [
          {
            type: 'text.plain',
            value: substring({
              start: m.position.end,
              end: token.position.end,
            }),
            position: {
              start: m.position.end,
              end: token.position.end,
            }}
        ], build)
        all = all.concat(rest)
      }

      return all
    }, [] as PhrasingContent[])
  }

  const parseText = (type: StyledText['type'], pattern: RegExp, content: PhrasingContent[]) =>
    parse(type, pattern, content, ({ position, captures }) => ({
      type,
      value: captures[2],
      position,
    }))

  tokens = parse('link', LINK_PATTERN, tokens, ({ position, captures }) => {
    const linkInfo = uri(captures[1])
    return {
      type: 'link',
      description: captures[2],
      ...linkInfo,
      position,
    }
  })

  tokens = parse('footnote.reference', FOOTNOTE_PATTERN, tokens, ({ position, captures }) => ({
    type: 'footnote.reference',
    label: captures[1],
    position,
  }))

  tokens = parseText('text.bold', markup('\\*'), tokens)
  tokens = parseText('text.verbatim', markup('='), tokens)
  tokens = parseText('text.italic', markup('/'), tokens)
  tokens = parseText('text.strikeThrough', markup('\\+'), tokens)
  tokens = parseText('text.underline', markup('_'), tokens)
  tokens = parseText('text.code', markup('~'), tokens)

  jump(e)
  return tokens.filter(t => {
    return t.type !== 'text.plain' || /\S/.test(t.value)
  })
}
