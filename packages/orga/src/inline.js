import Node from './node'

const LINK_PATTERN = /(.*?)\[\[([^\]]*)\](?:\[([^\]]*)\])?\](.*)/m; // \1 => link, \2 => text

const PRE = `[\\s\\({'"^]`
const POST = `[\\s-\\.,:!?'\\)}$]`
const BORDER = `[^,'"\\s]`

function markup(marker) {
  return RegExp(`(.*?${PRE})${marker}(${BORDER}.+?${BORDER})${marker}(${POST}.*)`, 'm')
}

function parse(text) {
  text = _parse(LINK_PATTERN, text, (captures) => {
    return new Node(`link`).with({ path: captures[0], desc: captures[1] })
  })


  const markups = [
    { name: `bold`, pattern: markup(`\\*`) },
    { name: `verbatim`, pattern: markup(`=`) },
    // { name: `italic`, pattern: `/` }, // TODO: deal with links first
    { name: `strike-through`, pattern: markup(`\\+`) },
    { name: `underline`, pattern: markup(`_`) },
    { name: `code`, pattern: markup(`~`) },
  ]
  for (const { name, pattern } of markups) {
    text = _parse(pattern, text, (captures) => { return new Node(name).with({ value: captures[0] }) })
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
