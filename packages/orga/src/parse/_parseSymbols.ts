import { Primitive } from '../types'
import primitive from './_primitive'

export default (text: string): { [key: string]: Primitive } => {
  let t = text
  const result = {}
  while (t.length > 0) {
    const m = t.match(/^:\w+/)
    if (!m) break

    const key = m[0].substring(1)
    t = t.slice(m[0].length)

    const end = t.match(/\s(:\w+)/)
    const index = end ? end.index + 1 : t.length
    const value = t.substring(0, index).trim()
    t = t.slice(index)

    result[key] = primitive(value)
  }

  return result
}
