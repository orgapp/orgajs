import { Point, Position } from 'unist'
import { map } from './position'

export const read = (text: string) => {

  const {
    shift,
    isLastLine,
    endOfLine,
    getLine,
    substring,
    toIndex,
    match, location,
  } = map(text)

  let line = 0
  let column = 0

  const isStartOfLine = () => column === 0

  const getChar = (offset: number = 0) => {
    return text.charAt(toIndex({ line, column }) + offset)
  }

  const skipWhitespaces = () : number => {
    const a = eat(/^\s+/)
    return 0
    // const count = getLine(line, column).search(/[^ \t]/)
    // if (count > 0) {
    //   column += count
    // }
    // return Math.max(0, count)
  }

  const now = () => ({ line, column })

  const eat = (param: 'char' | 'line' | RegExp | number) : Position => {
    const start = now()
    if (param === 'char') {
      const n = shift(start, 1)
      line = n.line
      column = n.column
    } else if (param === 'line') {
      column = endOfLine(line).column
    } else if (typeof param === 'number') {
      const n = shift(start, param)
      line = n.line
      column = n.column
    } else {
      const m = param.exec(getLine(line, column))
      if (m) {
        column += m.index + m[0].length
      }
    }

    return {
      start,
      end: { line, column }
    }
  }

  const eol = () => endOfLine(line)

  const EOF = () => {
    const index = toIndex(now())
    // console.log({ index, length: text.length, now: now() })
    return index >= text.length - 1
  }

  // const position = ({ offset, range }: { offset?: Point, range?: Range } = {}): Position => {
  //   const firstLine = getLineRangeByLineNumber(0)
  //   let ln = 0
  //   while (getLineRangeByLineNumber(ln)) {
  //     ln += 1
  //   }

  //   return {
  //     start: { line: 0, column: 0 },
  //     end: { line: ln, column: 0 }
  //   }
  // }

  const distance = ({ start, end }: Position) : number => {
    return toIndex(end) - toIndex(start)
  }

  const jump = (point: Point) => {
    line = point.line
    column = point.column
  }

  const reader: Reader = {
    isStartOfLine,
    getChar,
    getLine: () => getLine(line, column),
    skipWhitespaces,
    substring,
    now,
    distance,
    EOF,
    eat,
    eol,
    jump,
    match: (pattern: RegExp, position: Position = { start: now(), end: eol() }) => match(pattern, position),
  }

  return reader
}

export interface Reader {
  isStartOfLine: () => boolean;
  getChar: (offset?: number) => string;
  getLine: () => string;
  skipWhitespaces: () => number;
  substring: (position: Position) => string;
  now: () => Point;
  eol: () => Point;
  EOF: () => boolean;
  eat: (param: 'char' | 'line' | number | RegExp) => Position;
  jump: (point: Point) => void;
  distance: (position: Position) => number;
  match: (pattern: RegExp, position?: Position) => {
    captures: string[],
    position: Position;
  } | undefined;
}
