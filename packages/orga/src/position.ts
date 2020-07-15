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

  const getLineRangeByLineNumber = (ln: number): Range | undefined => {
    if (ln + 1 >= lines.length) return undefined
    return {
      start: lines[ln],
      end: lines[ln + 1],
    }
  }

  const isLastLine = (ln: number) => {
    return ln >= lines.length
  }

  const toIndex = ({ line, column }: Point) : number => {
    return lines[line] + column
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

  const getLine = (ln: number, offset: number = 0) => {
    const range = getLineRangeByLineNumber(ln)
    if (!range) {
      console.log(`>>>>>> cant get line range`)
      return ''
    }
    return text.substring(range.start + offset, range.end)
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

  const debug = () => {
    console.log({
      lines,
    })
  }

  return {
    getLineRangeByLineNumber,
    isLastLine,
    substring,
    getLine,
    location,
    position,
    match,
    toIndex,
    debug,
  }
}
