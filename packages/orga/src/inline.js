import Node from './node'

const LINK_PATTERN = /(.*?)\[\[([^\]]*)\](?:\[([^\]]*)\])?\](.*)/m; // \1 => link, \2 => text

const PRE = `(?:[\\s\\({'"]|^)`
const POST = `(?:[\\s-\\.,:!?'\\)}]|$)`
const BORDER = `[^,'"\\s]`

function markup(marker) {
  return RegExp(`(.*?${PRE})${marker}(${BORDER}.+?${BORDER})${marker}(${POST}.*)`, 'm')
}

function parse(text) {
  text = _parse(LINK_PATTERN, text, (captures) => {
    return new Node(`link`, [new Node(`text`).with({ value: captures[1] })])
      .with({ path: captures[0], desc: captures[1] })
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
      return new Node(name, [new Node(`text`).with({ value: captures[0] })])
      // return new Node(name).with({ value: captures[0] })
    })
  }
  return text
}


function _parse(pattern, text, post) {
  if (typeof text === `string`) {
    var m = pattern.exec(text)
    if (!m) return [new Node(`text`).with({ value: text })]
    m.shift()
    let before = m.shift()
    let after = m.pop()
    var nodes = []
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
      if (node.hasOwnProperty(`type`) && node.type != `text`) {
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

module.exports = {
  parse,
}
