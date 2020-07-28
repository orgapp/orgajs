import Node, { NodeType } from './node'
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
    return new Node(NodeType.Link)
      .with({ uri: uri(captures[0]), desc: captures[1] })
  })

  text = _parse(FOOTNOTE_PATTERN, text, (captures) => {
    return new Node(NodeType.FootnoteReference)
      .with({ label: captures[0] })
  })

  const markups: { name: NodeType, marker: string }[] = [
    { name: NodeType.Bold, marker: `\\*` },
    { name: NodeType.Verbatim, marker: `=` },
    { name: NodeType.Italic, marker: `/` },
    { name: NodeType.StrikeThrough, marker: `\\+` },
    { name: NodeType.Underline, marker: `_` },
    { name: NodeType.Code, marker: `~` },
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
    if (!m) return [new Node(NodeType.Text).with({ value: text })]
    m.shift()
    const before = m.shift()
    const after = m.pop()
    let nodes = []
    if ( before.length > 0 ) {
      nodes.push(new Node(NodeType.Text).with({ value: before }))
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
      if (node.hasOwnProperty(`type`) && node.type !== NodeType.Text) {
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
