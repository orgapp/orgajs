import { zonedTimeToUtc } from 'date-fns-tz'
import { read } from './reader'
import { Timestamp } from './types'

export const parse = (
  input: string,
  { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {}
): Timestamp | undefined => {
  const { match, eat, getChar, jump } = read(input)

  eat('whitespaces')
  const timestamp = () => {
    // opening
    const { value: opening } = eat(/[<[]/g)
    if (opening.length === 0) return
    const active = opening === '<'

    // date
    const { value: _date } = eat(/\d{4}-\d{2}-\d{2}/)
    let date = _date

    eat('whitespaces')

    let end: string | undefined

    // day
    const { value: _day } = eat(/[a-zA-Z]+/)
    eat('whitespaces')

    // time
    const time = match(/(\d{2}:\d{2})(?:-(\d{2}:\d{2}))?/)
    if (time) {
      date = `${_date} ${time.captures[1]}`
      if (time.captures[2]) {
        end = `${_date} ${time.captures[2]}`
      }
      jump(time.position.end)
    }

    // closing
    const closing = getChar()
    if (
      (opening === '[' && closing === ']') ||
      (opening === '<' && closing === '>')
    ) {
      eat('char')
      return {
        date: zonedTimeToUtc(date, timezone),
        end: end ? zonedTimeToUtc(end, timezone) : undefined,
      }
    }

    // opening closing does not match
  }

  const ts = timestamp()
  if (!ts) return

  if (!ts.end) {
    const { value: doubleDash } = eat(/--/)
    if (doubleDash.length > 0) {
      const end = timestamp()
      if (end) {
        ts.end = end.date
      }
    }
  }

  return ts
}
