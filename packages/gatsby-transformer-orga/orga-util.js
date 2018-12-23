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

const cleanup = str => {
  if (typeof str !== `string`) return str
  return str.trim().replace(/[<>\[\]]/g, '')
}

function tryToParseTimestamp(str) {
  let m = moment(cleanup(str), [
    `YYYY-MM-DD ddd HH:mm`,
    `YYYY-MM-DD ddd`,
    `YYYY-MM-DD`], true)
  return m.isValid() ? m.format() : str
}

exports.processMeta = settings => {
  return Object.keys(settings).reduce((result, k) => {
    if (shouldBeArray(k) && typeof settings[k] === `string`)
      return { ...result, [k]: settings[k].match(/[^ ]+/g) }
    return { ...result, [k]: tryToParseTimestamp(settings[k])}
  }, settings)
}


exports.sanitise = title => {
  return title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
}
