import { Point, Position } from 'unist'
import { CoreAPI } from '../core'

export default <T extends CoreAPI>(core: T) => {
  const linePosition = (
    start: number | Point,
    end?: number | Point
  ): Position | undefined => {
    let result: Position | undefined

    if (typeof start === 'number') {
      result = linePosition(core.toPoint(start))
    } else {
      const s = core.bol(start.line)
      const e = core.eol(start.line)
      if (!s || !e) return undefined
      result = {
        start: s,
        end: e,
      }
    }

    if (end && result) {
      const endLR = linePosition(end)
      if (!endLR) return undefined
      result.end = endLR.end
    }

    return result
  }

  const endOfLine = (ln: Point | number) => {
    const pos = linePosition(ln)
    if (!pos) return undefined
    return pos.end
  }

  const beginOfLine = (ln: Point | number) => {
    const pos = linePosition(ln)
    if (!pos) return undefined
    return pos.start
  }
  return {
    ...core,
    linePosition,
    endOfLine,
    beginOfLine,
  }
}
