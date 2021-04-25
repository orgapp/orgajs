import { DateTime } from 'luxon'
import { read } from './reader'
import { Timestamp } from './types'

export const parse = (
  input: string,
  { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {},
): Timestamp | undefined => {

  const { match, eat, getChar, jump } = read(input)

  eat('whitespaces')
  const timestamp = () => {

    // opening
    const { value: opening } = eat(/[<[]/g)
    if (opening.length === 0) return
    const active = opening === '<'

    // date
    const date = match(/(\d{4})-(\d{2})-(\d{2})/)
    if (!date) return
    const [, year, month, day] = date.captures
    eat('whitespaces')

    const obj: any = {
      year, month, day, zone: timezone,
    }

    let end: any

    // day
    const { value: _day } = eat(/[a-zA-Z]+/)
    eat('whitespaces')

    // time
    const time = match(/(\d{2}):(\d{2})(?:-(\d{2}):(\d{2}))?/)
    if (time) {
      obj.hour = time.captures[1]
      obj.minute = time.captures[2]
      if (time.captures[3]) {
        end = { ...obj }
        end.hour = time.captures[3]
        end.minute = time.captures[4]
      }
      jump(time.position.end)
    }

    // closing
    const closing = getChar()
    if ((opening === '[' && closing === ']') ||
      (opening === '<' && closing === '>')) {

      eat('char')
      return {
        date: DateTime.fromObject(obj).toJSDate(),
        end: end ? DateTime.fromObject(end).toJSDate() : undefined,
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
      if (!!end) {
        ts.end = end.date
      }
    }
  }

  return ts
}
