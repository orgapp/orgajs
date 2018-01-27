import Node from './node'

function parse(text) {
  // TODO: inline parsing
  return emphasis(`bold`, `\\*`, text)
  // return [ new Node(`text`).with({ value: text }) ]
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
    return text.reduce([], (all, node) => {
      if (node.name != `text`) {
        return all + [node]
      }
      return all + emphasis(name, marker, node.value)
    })
  }

  return emphasis(name, marker, text.value)
}

module.exports = {
  parse,
  emphasis,
  pattern,
}
