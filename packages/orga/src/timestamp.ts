import { DateTime } from 'luxon'
import XRegExp from 'xregexp'
import { Timestamp } from './types'

const _timestampPattern = () => {
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

  const pattern = `^\\s*\
(${single('begin')})\
(?:--${single('end')})?\
\\s*$\
`

  return pattern
}

const pattern = _timestampPattern()


const parse = (
  input: string,
  { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {},
): Timestamp | undefined => {
  let m: any = input
  if (typeof input === 'string') {
    m = XRegExp(pattern, 'i').exec(m)
  }
  if (!m) return undefined

  const beginDate = m[2];
  const beginTimeBegin = m[3];
  const beginTimeEnd = m[4];
  const endDate = m[5];
  const endTimeBegin = m[6];

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

export {
  parse,
  pattern,
}
