import Node from './node'

function parse(text) {
  // TODO: inline parsing
  const markups = [
    { name: `bold`, marker: `\\*` },
    { name: `verbatim`, marker: `=` },
    // { name: `italic`, marker: `/` }, // TODO: deal with links first
    { name: `strike-through`, marker: `\\+` },
    { name: `underline`, marker: `_` },
    { name: `code`, marker: `~` },
  ]
  for (const { name, marker } of markups) {
    text = emphasis(name, marker, text)
  }
  return text
}

function pattern(marker) {
  return RegExp(`(.*?)${marker}(.+?)${marker}(.*)`, 'm')
}

// function emphasis(name, marker, nodes) {
//   return nodes.reduce([], (all, node) => {
//     if (node.name != `text`) {
//       return all + [node]
//     }
//     var m = pattern(marker).exec(node.value)
//     let before = m[1]
//     let match = m[2]
//     let after = m[3]
//     return all + newNodes
//   })
// }

function emphasis(name, marker, text) {
  if (typeof text === `string`) {
    var m = pattern(marker).exec(text)
    if (!m) return [new Node(`text`).with({ value: text })]
    let before = m[1]
    let match = m[2]
    let after = m[3]
    var nodes = [ new Node(`text`).with({ value: before }) ]
    if (match) {
      nodes.push(new Node(name).with({ value: match }))
    }
    if (after) {
      nodes = nodes.concat(emphasis(name, marker, after))
    }
    return nodes
  }

  if (Array.isArray(text)) {
    return text.reduce((all, node) => {
      if (node.hasOwnProperty(`type`) && node.type != `text`) {
        return all.concat(node)
      }
      return all.concat(emphasis(name, marker, node))
    }, [])
  }

  if (typeof text.value === `string`) {
    return emphasis(name, marker, text.value)
  }
  return undefined
}

module.exports = {
  parse,
  emphasis,
  pattern,
}
