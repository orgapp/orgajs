const moment = require('moment')
const { selectAll } = require('unist-util-select')

exports.getProperties = headline => {
  const drawer = selectAll(`drawer`, headline).find(d => d.name === `PROPERTIES`)
  if (!drawer) return {}
  const regex = /\s*:(.+):\s*(.+)\s*$/

  return drawer.value.split(`\n`).reduce((accu, current) => {
    let m = current.match(regex)
    return { ...accu, [m[1].toLowerCase()]: m[2] }
  }, {})
}

const shouldBeArray = key => [`tags`].includes(key)

exports.processMeta = settings => {
  return Object.keys(settings).reduce((result, k) => {
    if (shouldBeArray(k))
      return { ...result, [k]: settings[k].match(/[^ ]+/g) }
    return result
  }, settings)
}


exports.sanitise = title => {
  return title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
}

exports.getTimestamp = timestamp => {
  return moment(timestamp, `YYYY-MM-DD ddd HH:mm`).format()
}
