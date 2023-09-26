import { Point, Position } from 'unist'
import { CoreAPI } from '../core.js'

export default <T extends CoreAPI>(core: T) => {
  function linePosition(
    start: number | Point,
    end?: number | Point
  ): Position | null {
    let result: Position | null

    if (typeof start === 'number') {
      result = linePosition(core.toPoint(start))
    } else {
      const s = core.bol(start.line)
      const e = core.eol(start.line)
      if (!s || !e) return null
      result = {
        start: s,
        end: e,
      }
    }

    if (end && result) {
      const endLR = linePosition(end)
      if (!endLR) return null
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
