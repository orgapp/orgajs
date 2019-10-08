const { DateTime } = require('luxon')

namespace Timestamp {
  const date = `\\d{4}-\\d{2}-\\d{2}`
  const time = `\\d{2}:\\d{2}`
  const day = `[a-zA-Z]+`
  const open = `[<\\[]`
  const close = `[>\\]]`

  const single = prefix => `\
${open}\
(?<${prefix}Date>${date})\
\\s+${day}\
(?:\\s+(?<${prefix}TimeBegin>${time})\
(?:-(?<${prefix}TimeEnd>${time}))?)?\
${close}\
`

  export const full = `^\\s*\
(${single('begin')})\
(?:--${single('end')})?\
\\s*$\
`
}

export const pattern = Timestamp.full

export const parse = (
  input,
  { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {},
) => {
  let m = input
  if (typeof input === 'string') {
    m = RegExp(Timestamp.full, 'i').exec(m)
  }
  if (!m) return null

  const {
    beginDate, beginTimeBegin, beginTimeEnd,
    endDate, endTimeBegin
  } = m.groups

  const _parseDate = (date, time) => {
    let text = date
    let format = `yyyy-MM-dd`
    if (time) {
      text += ` ${time}`
      format += ` HH:mm`
    }
    return DateTime.fromFormat(text, format, { zone: timezone }).toJSDate()
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
