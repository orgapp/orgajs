import { Point, Position } from 'unist'
import { CoreAPI } from './core'
import { Range } from './index'
import enhance from './utils'

const PAIRS: Record<string, string> = [
  ['{', '}'],
  ['[', ']'],
  ['(', ')'],
  ['<', '>'],
].reduce((all, [l, r]) => {
  return {
    ...all,
    [l]: r,
    [r]: l,
  }
}, {})

const reader = (_core: CoreAPI, range: Partial<Range> = {}) => {
  const core = enhance(_core)

  let cursor = core.toIndex(range.start || 0)
  const end = range.end ? core.toIndex(range.end) : core.text.length

  const getChar = (offset = 0) => {
    const index = cursor + offset
    if (index >= end || index < 0) return undefined
    return core.text.charAt(index)
  }

  const getLine = () => {
    const pos = core.linePosition(cursor)
    if (!pos) return undefined
    return core.substring(cursor, pos.end)
  }

  const jump = (point: Point) => {
    cursor = Math.min(end, point.offset || core.toIndex(point))
  }

  const now = () => core.toPoint(cursor)

  const eat = (
    param:
      | 'char'
      | 'line'
      | 'whitespaces'
      | 'newline'
      | RegExp
      | number = 'char'
  ): { position: Position; value: string } | undefined => {
    let value: string | undefined

    const position = {
      start: core.toPoint(cursor),
      end: core.toPoint(cursor),
    }

    if (cursor >= end) return undefined
    if (param === 'char') {
      value = getChar()
      cursor += 1
    } else if (param === 'line') {
      const lineEnd = core.linePosition(cursor)
      const e = !lineEnd ? end : Math.min(end, lineEnd.end.offset!)
      value = core.substring(cursor, e)
      cursor = e
    } else if (param === 'whitespaces') {
      return eat(/^[ \t]+/)
    } else if (param === 'newline') {
      return eat(/^[\n\r]/)
    } else if (typeof param === 'number') {
      const adv = Math.min(param, end - cursor)
      value = core.text.substring(cursor, cursor + adv)
      cursor += adv
    } else {
      const m = match(param)
      if (!m) return
      cursor = m.position.end.offset!
      value = m.result[0]
    }

    position.end = core.toPoint(cursor)
    return {
      position,
      value: value || '',
    }
  }

  const match = (pattern: RegExp, range: Partial<Position> = {}) => {
    const s = range.start?.offset || cursor
    const e = range.end?.offset || end
    const str = core.text.substring(s, e)
    const m = pattern.exec(str)
    if (!m) return
    return {
      result: m,
      position: {
        start: core.toPoint(cursor + m.index),
        end: core.toPoint(cursor + m.index + m[0].length),
      },
    }
  }

  const findClosing = (index: Point | number = cursor) => {
    let cursor = core.toIndex(index)
    const opening = core.text.charAt(cursor)
    if (!opening) return
    const closing = PAIRS[opening] || opening

    let balance = 1
    cursor += 1
    while (cursor < end) {
      const char = core.text.charAt(cursor)
      if (char === opening) {
        balance += 1
      }

      if (char === closing) {
        if (opening !== closing) {
          balance -= 1
        } else {
          balance = 0
        }
      }

      if (balance === 0) {
        return core.toPoint(cursor)
      }
      cursor += 1
    }
  }

  const isStartOfLine = () => {
    return cursor === 0 || getChar(-1) === '\n'
  }

  return {
    ...core,
    getChar,
    getLine,
    eat,
    jump,
    match,
    findClosing,
    isStartOfLine,
    now: () => {
      return now()
    },

    beginOfLine: () => core.beginOfLine(cursor),
    endOfLine: () => core.endOfLine(cursor),

    read: (range: Partial<Range> = {}) => {
      return reader(_core, {
        start: range.start || cursor,
        end: range.end || end,
      })
    },
  }
}

export default reader
