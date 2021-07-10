import { Point } from 'unist'
import { Reader } from '../reader'
// import { inspect }  from 'util'
import { parse as parseTimestamp } from '../timestamp'
import { Token } from '../types'
import * as tk from './util';

interface Props {
  reader: Reader;
  keywords: string[];
  timezone: string;
}


export default ({ reader, keywords, timezone }: Props): Token[] => {
  const { eat, substring, now, getLine } = reader

  const p = RegExp(`(${keywords.join('|')}):`, 'g')

  const currentLine = getLine()

  const { line, column } = now()

  const getLocation = (offset: number): Point => ({
    line, column: column + offset,
  })

  const all: Token[] = []

  const parseLastTimestamp = (end: number) => {
    if (all.length === 0) return
    const { type, position } = all[all.length - 1]
    if (!position) throw Error(`position is ${position}`)
    if (type !== 'planning.keyword') return
    const endLocation = getLocation(end)
    const timestampPosition = { start: position.end, end: endLocation }
    const value = substring(timestampPosition)
    const stamp = parseTimestamp(value, { timezone });
    if (stamp) {
      all.push(tk.tokPlanningTimestamp(stamp, {
        position: timestampPosition
      }));
    }
  }

  let m
  while ((m = p.exec(currentLine)) !== null) {
    parseLastTimestamp(m.index)

    all.push(tk.tokPlanningKeyword(m[1], {
      position: {
        start: getLocation(m.index),
        end: getLocation(p.lastIndex),
      }
    }));
  }
  parseLastTimestamp(currentLine.length)
  eat('line')

  // console.log(inspect(all, false, null, true))
  return all
}
