import { DateTime } from 'luxon'

enum TimestampPattern {
  date = '\\d{4}-\\d{2}-\\d{2}',
  time = '\\d{2}:\\d{2}',
  day = '[a-zA-Z]+',
  open = '[<\\[]',
  close = '[>\\]]',
}

const single = (prefix: string) => `\
${TimestampPattern.open}\
(?<${prefix}Date>${TimestampPattern.date})\
\\s+${TimestampPattern.day}\
(?:\\s+(?<${prefix}TimeBegin>${TimestampPattern.time})\
(?:-(?<${prefix}TimeEnd>${TimestampPattern.time}))?)?\
${TimestampPattern.close}\
`

export const pattern = `^\\s*\
(${single('begin')})\
(?:--${single('end')})?\
\\s*$\
`

export const parse = (
  input: string,
  { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {},
) => {
  const m = RegExp(pattern, 'i').exec(input)
  if (!m) return null

  const {
    beginDate, beginTimeBegin, beginTimeEnd,
    endDate, endTimeBegin
  } = m.groups

  const _parseDate = (date: string, time: string) => {
    let text = date
    let format = `yyyy-MM-dd`
    if (time) {
      text += ` ${time}`
      format += ` HH:mm`
    }
    return DateTime.fromFormat(text, format, { zone: timezone }).toJSDate()
  }


  const date = _parseDate(beginDate, beginTimeBegin)
  let end: string
  if (beginTimeEnd) {
    end = _parseDate(beginDate, beginTimeEnd)
  } else if (endDate) {
    end = _parseDate(endDate, endTimeBegin)
  }

  return { date, end }
}
