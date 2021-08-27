import { Point, Position } from 'unist'

const clamp = (num: number, min: number, max: number) => {
  return num > max ? max : num < min ? min : num
}

export interface CoreAPI {
  readonly text: string
  readonly numberOfLines: number
  toPoint: (index: number) => Point
  toIndex: (point: Point | number) => number
  bol: (ln: number) => Point | undefined
  eol: (ln: number) => Point | undefined

  /** Offset the given `point` by the provided `offset`. */
  shift: (point: Point, offset: number) => Point
}

function core(text: string): CoreAPI {
  const strLines = text.split(/^/gm)
  const lines: number[] = strLines.length > 0 ? [0] : [] // index of line starts
  strLines
    .slice(0, strLines.length - 1)
    .forEach((l, i) => lines.push(lines[i] + l.length))

  const bof = (): Point => ({ line: 1, column: 1, offset: 0 })

  const eof = (): Point =>
    lines.length === 0
      ? { line: 1, column: 1, offset: 0 }
      : {
          line: lines.length,
          column: text.length - lines[lines.length - 1] + 1,
          offset: text.length,
        }

  const bol = (ln: number): Point | undefined => {
    const lineIndex = ln - 1
    if (lineIndex >= lines.length || lineIndex < 0) return undefined
    return { line: ln, column: 1, offset: lines[ln - 1] }
  }

  const eol = (ln: number): Point | undefined => {
    if (ln > lines.length || ln < 1) return undefined
    const lastLine = ln === lines.length
    return lastLine
      ? eof()
      : {
          line: ln + 1,
          column: 1,
          offset: lines[ln],
        }
  }

  const shift = (point: Point, offset: number): Point => {
    return toPoint(toIndex(point) + offset)
  }

  const _linePosition = (position: Position | Point | number): Position => {
    if (typeof position === 'number') {
      if (position >= text.length) {
        return {
          start: eof(),
          end: eof(),
        }
      }
      if (position < 0) {
        return {
          start: bof(),
          end: bof(),
        }
      }

      const lineIndex = lines.findIndex((l) => l > position)

      const start =
        lineIndex > 0
          ? {
              line: lineIndex,
              column: 1,
              offset: lines[lineIndex - 1],
            }
          : {
              line: lines.length,
              column: 1,
              offset: lines[lines.length - 1],
            }

      const end =
        lineIndex > 0
          ? {
              line: lineIndex + 1,
              column: 1,
              offset: lines[lineIndex],
            }
          : eof()

      return {
        start,
        end,
      }
    }

    if ('start' in position) {
      return {
        start: _linePosition(position.start).start,
        end: _linePosition(position.end).end,
      }
    }
    if (position.offset) {
      return _linePosition(position.offset)
    }

    return _linePosition(lines[position.line] + position.column - 1)
  }

  const toPoint = (index: number): Point => {
    if (index <= 0) return { line: 1, column: 1, offset: 0 }
    if (index >= text.length) return eof()
    let lineIndex = lines.findIndex((l) => l > index)
    if (lineIndex < 0) {
      lineIndex = lines.length
    }

    return {
      line: lineIndex,
      column: index - lines[lineIndex - 1] + 1,
      offset: index,
    }
  }

  const toIndex = (point: Point | number): number => {
    if (typeof point === 'number') return clamp(point, 0, text.length)
    if (point.offset) return clamp(point.offset, 0, text.length)
    const lineIndex = point.line - 1
    if (lineIndex < 0 || lines.length === 0) return 0
    if (lineIndex >= lines.length) return text.length
    const i = lines[lineIndex] + point.column - 1
    return Math.min(i, text.length)
  }

  return {
    get text() {
      return text
    },
    get numberOfLines() {
      return lines.length
    },
    shift,
    toPoint,
    toIndex,
    bol,
    eol,
  }
}

export default core
