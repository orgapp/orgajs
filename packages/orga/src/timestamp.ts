import { zonedTimeToUtc } from 'date-fns-tz'
import { read } from 'text-kit'
import { Timestamp } from './types'

export const parse = (
  input: string,
  { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {}
): Timestamp | undefined => {
  const { match, eat, getChar, jump } = read(input)

  eat('whitespaces')
  const timestamp = () => {
    // opening
    const opening = eat(/[<[]/g)
    if (!opening) return
    const active = opening.value === '<'

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
      date = `${_date} ${time.result[1]}`
      if (time.result[2]) {
        end = `${_date} ${time.result[2]}`
      }
      jump(time.position.end)
    }

    // closing
    const closing = getChar()
    if (
      (opening.value === '[' && closing === ']') ||
      (opening.value === '<' && closing === '>')
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
    const doubleDash = eat(/--/)
    if (doubleDash) {
      const end = timestamp()
      if (end) {
        ts.end = end.date
      }
    }
  }

  return ts
}
