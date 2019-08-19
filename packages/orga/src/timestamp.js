const _timestamp = {
  date: `\\d{4}-\\d{2}-\\d{2}`,
  time: `\\d{2}:\\d{2}`,
  day: `[a-zA-Z]+`,
  open: `[<\\[]`,
  close: `[>\\]]`,
}

_timestamp.single = prefix => `\
${_timestamp.open}\
(?<${prefix}Date>${_timestamp.date})\
\\s+${_timestamp.day}\
(?:\\s+(?<${prefix}TimeBegin>${_timestamp.time})\
(?:-(?<${prefix}TimeEnd>${_timestamp.time}))?)?\
${_timestamp.close}\
`

_timestamp.full = `^\\s*\
(${_timestamp.single('begin')})\
(?:--${_timestamp.single('end')})?\
\\s*$\
`
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const parse = input => {
  let m = input
  if (typeof input === 'string') {
    m = RegExp(_timestamp.full, 'i').exec(m)
  }
  if (!m) return null

  const {
    beginDate, beginTimeBegin, beginTimeEnd,
    endDate, endTimeBegin
  } = m.groups

  const _parseDate = (date, time) => {
    let str = date
    if (time) str += ` ${time}:00`
    str += ` (${timezone})`
    return Date.parse(str)
  }


  const date = _parseDate(beginDate, beginTimeBegin)
  let end
  if (beginTimeEnd) {
    end = _parseDate(beginDate, beginTimeEnd)
  } else if (endDate) {
    end = _parseDate(endDate, endTimeBegin)
  }

  return { date, end }
}

module.exports = {
  parse,
  pattern: _timestamp.full,
}
