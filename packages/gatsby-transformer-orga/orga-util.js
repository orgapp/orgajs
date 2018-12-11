const { selectAll } = require('unist-util-select')

exports.getProperties = headline => {
  const drawer = selectAll(`drawer`, headline).find(d => d.name === `PROPERTIES`)
  if (!drawer) return {}
  const regex = /\s*:(.+):\s*(.+)\s*$/
  return drawer.value.split(`\n`).reduce((accu, current) => {
    let m = current.match(regex)
    accu[m[1].toLowerCase()] = m[2]
    return accu
  }, {})
}
