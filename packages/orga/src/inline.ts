import Node from './node'
import uri from './uri'

const LINK_PATTERN = /(.*?)\[\[([^\]]*)\](?:\[([^\]]*)\])?\](.*)/m; // \1 => link, \2 => text
const FOOTNOTE_PATTERN = /(.*?)\[fn:(\w+)\](.*)/

const PRE = `(?:[\\s\\({'"]|^)`
const POST = `(?:[\\s-\\.,:!?'\\)}]|$)`
const BORDER = `[^,'"\\s]`

function markup(marker: string) {
  return RegExp(`(.*?${PRE})${marker}(${BORDER}(?:.*?(?:${BORDER}))??)${marker}(${POST}.*)`, 'm')
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

const shiftPosition = (position: Position, offset: Point) => {
  return {
    start: shift(position.start, offset),
    end: shift(position.end, offset),
  }
}

export const tokenize = (text: string, offset: Point | undefined) : Token[] => {
  const start = { line: 0, column: 0 }
  const end = { line: 0, column: text.length }
  const tokens = [
    { name: 'text.plain', position: { start, end } }
  ]
  if (offset) {
    return tokens.map(token => ({
      name: token.name,
      position: shiftPosition(token.position, offset)
    }))
  }
  return tokens
}
