interface Point {
  line: number;
  column: number;
}

interface Position {
  start: Point;
  end: Point;
}

export default (text: string) => {

  let cursor = 0
  const lines: number[] = [] // index of line starts
  do {
    lines.push(cursor)
    const nl = text.indexOf('\n', cursor)
    cursor = nl + 1
  } while (cursor > 0 && cursor < text.length)

  const toIndex = ({ line, column }: Point): number => {
    if (line >= lines.length) return text.length
    return Math.min(lines[line] + column, text.length)
  }

  const isLastLine = (ln: number) => {
    return ln >= lines.length
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

  const location = (query: number): Point => {
    const line = findLine(query, 0, lines.length)
    const column = Math.min(query, text.length) - lines[line]
    return {
      line,
      column,
    }
  }

  // const substring = (position: Position): string => {
  //   return text.substring(
  //     position.start.offset,
  //     position.end.offset)
  // }

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

  const linePosition = (ln: number): Position => {
    if (ln < 0 || ln >= lines.length) return undefined
    const nextLine = lines[ln + 1]
    const endIndex = nextLine ? nextLine - 1 : text.length
    return {
      start: { line: ln, column: 0 },
      end: location(endIndex),
    }
  }

  const substring = ({ start, end = 'EOL' }: {
    start: Point | number,
    end?: Point | number | 'EOL' | 'EOF' }): string => {

    const startPos = typeof start === 'number' ?
      start :
      lines[start.line] + (start.column || 0)

    const startLine = typeof start === 'number' ?
      start :
      start.line

    let endPos: number
    if (end === 'EOL') {
      const { line, column = 0 } = linePosition(startLine).end
      endPos = lines[line] + column
    } else if (end === 'EOF') {
      endPos = text.length
    } else if (typeof end === 'number') {
      endPos = end
    } else {
      endPos = lines[end.line] + (end.column || 0)
    }
    return text.substring(startPos, endPos)
  }

  return {
    get numberOfLines(): number {
      return lines.length
    },
    substring,
    linePosition,
    location,
    match,
    toIndex,
    shift,
  }
}
