import Node from './node'
import uri from './uri'
import { map } from './position'

const LINK_PATTERN = /\[\[([^\]]*)\](?:\[([^\]]*)\])?\]/m; // \1 => link, \2 => text
const FOOTNOTE_PATTERN = /\[fn:(\w+)\]/

const PRE = `[\\s\\({'"]|^`
const POST = `[\\s-\\.,:!?'\\)}]|$`
const BORDER = `[^,'"\\s]`

function markup(marker: string) {
  return RegExp(`(?<=(${PRE}))${marker}(${BORDER}(?:.*?(?:${BORDER}))??)${marker}(?=(${POST}.*))`, 'm')
}

export const parse = (text: string) => {
  text = _parse(LINK_PATTERN, text, (captures) => {
    return new Node(`link`)
      .with({ uri: uri(captures[0]), desc: captures[1] })
  })

  text = _parse(FOOTNOTE_PATTERN, text, (captures) => {
    return new Node(`footnote.reference`)
      .with({ label: captures[0] })
  })

  const markups = [
    { name: `bold`, marker: `\\*` },
    { name: `verbatim`, marker: `=` },
    { name: `italic`, marker: `/` },
    { name: `strikeThrough`, marker: `\\+` },
    { name: `underline`, marker: `_` },
    { name: `code`, marker: `~` },
  ]
  for (const { name, marker } of markups) {
    text = _parse(markup(marker), text, (captures) => {
      return new Node(name, captures[0])
    })
  }
  return text
}

function _parse(pattern, text, post) {
  if (typeof text === `string`) {
    const m = pattern.exec(text)
    if (!m) return [new Node(`text`).with({ value: text })]
    m.shift()
    const before = m.shift()
    const after = m.pop()
    let nodes: Node[] = []
    if ( before.length > 0 ) {
      nodes.push(new Node(`text`).with({ value: before }))
    }
    if (m.length > 0) {
      nodes.push(post(m))
      // nodes.push(new Node(name).with({ value: match }))
    }
    if (after) {
      nodes = nodes.concat(_parse(pattern, after, post))
    }
    return nodes
  }

  if (Array.isArray(text)) {
    return text.reduce((all, node) => {
      if (node.hasOwnProperty(`type`) && node.type !== `text`) {
        return all.concat(node)
      }
      return all.concat(_parse(pattern, node, post))
    }, [])
  }

  if (typeof text.value === `string`) {
    return _parse(pattern, text.value, post)
  }
  return undefined
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

export const tokenize = (text: string, offset: Point | undefined = undefined) : Token[] => {

  const { position, match, toIndex } = map(text)
  let tokens = [
    { name: DEFAULT_TOKEN_NAME, position: position() }
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
      if (toIndex(m.position.start) > toIndex(token.position.start)) {
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

      if (toIndex(m.position.end) < toIndex(token.position.end)) {
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

  if (offset) {
    return tokens.map(token => ({
      name: token.name,
      position: shiftPosition(token.position, offset)
    }))
  }
  return tokens
}
