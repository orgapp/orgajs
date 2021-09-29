import { Point } from 'unist'
import { Reader } from 'text-kit'
import { parse as parseTimestamp } from '../timestamp'
import { Token } from '../types'

export default ({
    keywords,
    timezone,
  }: {
    keywords: string[]
    timezone: string
  }) =>
  (reader: Reader): Token[] | void => {
    const { now, match, eat, substring, getLine } = reader

    const pattern = `(${keywords.join('|')}):`

    if (!match(RegExp(pattern, 'y'))) return

    const currentLine = getLine()

    const { line, column, offset } = now()

    const getLocation = (_offset: number): Point => ({
      line,
      column: column + _offset,
      offset: offset + _offset,
    })

    const all: Token[] = []

    const parseLastTimestamp = (end: number) => {
      if (all.length === 0) return
      const { type, position } = all[all.length - 1]
      if (!position) throw Error(`position is ${position}`)
      if (type !== 'planning.keyword') return
      const endLocation = getLocation(end)
      const timestampPosition = { start: position.end, end: endLocation }
      const value = substring(timestampPosition.start, timestampPosition.end)
      all.push({
        type: 'planning.timestamp',
        value: parseTimestamp(value, { timezone }),
        position: timestampPosition,
      })
    }

    let m
    const p = RegExp(pattern, 'g')
    while ((m = p.exec(currentLine)) !== null) {
      parseLastTimestamp(m.index)

      all.push({
        type: 'planning.keyword',
        value: m[1],
        position: {
          start: getLocation(m.index),
          end: getLocation(p.lastIndex),
        },
      })
    }
    parseLastTimestamp(currentLine.length)
    eat('line')

    return all
  }
