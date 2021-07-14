import { Point, Position } from 'unist';

export default (text: string) => {

  let cursor = 0
  const lines: number[] = [] // index of line starts
  do {
    lines.push(cursor)
    const nl = text.indexOf('\n', cursor)
    cursor = nl + 1
  } while (cursor > 0 && cursor < text.length)

  const toIndex = ({ line, column }: Point): number => {
    if (line < 1) return 0
    if (line > lines.length) return text.length
    const index = lines[line - 1] + column - 1
    return Math.max(0, Math.min(index, text.length))
  }

  const middle = (start: number, end: number) => {
    return start + Math.floor((end - start) / 2)
  }

  const findLine = (index: number, start: number, end: number): number => {
    if (index < 0) return 1
    if (index >= text.length) return lines.length
    const mid = middle(start, end)
    if (lines[mid - 1] > index) return findLine(index, start, mid)
    if (lines[mid] <= index) return findLine(index, mid, end)
    return mid
  }

  const location = (index: number): Point => {
    const line = findLine(index, 1, lines.length + 1)
    const column = Math.min(index, text.length) - toIndex({ line, column: 1 }) + 1
    return {
      line,
      column,
    }
  }

  const match = (
    pattern: RegExp,
    position: Position,
  ): { position: Position, captures: string[] } | undefined => {
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

  const shift = (point: Point, offset: number): Point => {
    return location(toIndex(point) + offset)
  }

  const linePosition = (ln: number): Position | undefined => {
    if (ln < 1 || ln > lines.length) return undefined
    const nextLine = lines[ln]
    const endIndex = nextLine ? nextLine - 1 : text.length
    // console.log({ nextLine, endIndex, end: location(endIndex) })
    return {
      start: { line: ln, column: 1 },
      end: location(endIndex),
    }
  }

  const substring = ({ start, end = 'EOL' }: {
    start: Point,
    end?: Point | 'EOL' | 'EOF'
  }): string => {

    let endIndex: number | undefined;
    if (end === 'EOL') {
      const lp = linePosition(start.line)
      if (!lp) {
        console.log({ start })
      }
      const lineEnd = linePosition(start.line)?.end;
      if (lineEnd) {
        endIndex = toIndex(lineEnd)
      }
    } else if (end === 'EOF') {
      endIndex = text.length
    } else {
      endIndex = toIndex(end)
    }
    return text.substring(toIndex(start), endIndex)
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
