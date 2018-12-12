const moment = require('moment')
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

exports.sanitise = title => {
  return title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
}

exports.getTimestamp = timestamp => {
  return moment(timestamp, `YYYY-MM-DD ddd HH:mm`).format()
}
