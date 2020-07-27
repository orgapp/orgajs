import { Point, Position } from 'unist'

export const isEqual = (p1: Point, p2: Point) => {
  return p1.line === p2.line && p1.column === p2.column
}

const compare = (p1: Point, p2: Point): boolean => {
  if (p1.line > p2.line) return true
  if (p1.line === p2.line && p1.column > p2.column) return true
  return false
}

export const after = (p1: Point) => (p2: Point) => {
  return compare(p2, p1)
}

export const before = (p1: Point) => (p2: Point) => {
  return compare(p1, p2)
}

export const isEmpty = (position: Position) => {
  return !position || isEqual(position.start, position.end)
}

export const map = (text: string) => {

  let cursor = 0
  const lines: number[] = [] // index of line starts
  do {
    lines.push(cursor)
    const nl = text.indexOf('\n', cursor)
    cursor = nl + 1
  } while (cursor > 0 && cursor < text.length)

  // const getLineRangeByIndex = (start: number) : Range => {
  //   const end = text.indexOf('\n', start)
  //   return {
  //     start,
  //     end: end >= 0 ? end + 1 : text.length,
  //   }
  // }

  // const getLineRangeByLineNumber = (ln: number): Range | undefined => {
  //   if (ln + 1 >= lines.length) return undefined
  //   return {
  //     start: lines[ln],
  //     end: lines[ln + 1],
  //   }
  // }

  const isLastLine = (ln: number) => {
    return ln >= lines.length
  }

  const toIndex = ({ line, column }: Point) : number => {
    if (line >= lines.length) return text.length
    return Math.min(lines[line] + column, text.length)
  }

  const substring = (position: Position) : string => {
    const start = toIndex(position.start)
    const end = toIndex(position.end)
    return text.substring(start, end)
  }

  const middle = (start, end) => {
    return start + Math.floor((end - start) / 2)
  }

  const findLine = (index: number, left: number, right: number) => {
    if (index < 0) return 0
    if (index >= text.length) return lines.length - 1
    const mid = middle(left, right)
    if (lines[mid] > index) return findLine(index, left, mid)
    if (lines[mid + 1] <= index) return findLine(index, mid, right)
    return mid
  }

  const location = (index: number): Point => {
    const line = findLine(index, 0, lines.length)
    const column = Math.min(index, text.length) - lines[line]
    return {
      line,
      column,
    }
  }

  const position = (): Position => {
    return {
      start: { line: 0, column: 0 },
      end: { line: lines.length - 1, column: text.length - lines[lines.length - 1] }
    }
  }

  const endOfLine = (ln: number): Point => {
    const i = text.indexOf('\n', lines[ln])
    const _i = i >= 0 ? i : text.length
    return {
      line: ln,
      column: _i - lines[ln],
    }
  }

  const getLine = (ln: number, offset: number = 0) => {
    if (ln >= lines.length) return ''
    const start = lines[ln]
    const nextLine = lines[ln + 1]
    const end = nextLine ? nextLine - 1 : text.length
    return text.substring(start + offset, end)
  }

  const match = (
    pattern: RegExp,
    position: Position,
  ) : { position: Position, captures: string[] } | undefined => {
    const content = substring(position)
    if (!content) return undefined
    const match = pattern.exec(content)
    if (!match) return undefined
    const offset = toIndex(position.start)
    const captures = match.map(m => m)
    return {
      captures,
      position: {
        start: location(offset + match.index) as Point,
        end: location(offset + match.index + match[0].length) as Point,
      }
    }
  }

  const shift = (point: Point, offset: number) : Point => {
    return location(toIndex(point) + offset)
  }

  const debug = () => {
    console.log({
      lines,
    })
  }

  return {
    // getLineRangeByLineNumber,
    isLastLine,
    substring,
    endOfLine,
    getLine,
    location,
    position,
    match,
    toIndex,
    shift,
    debug,
  }
}
