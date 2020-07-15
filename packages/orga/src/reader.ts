import { map } from './position'

export const read = (text: string) => {

  const {
    getLineRangeByLineNumber,
    isLastLine,
    getLine,
    substring } = map(text)

  let line = 0
  let column = 0

  const isStartOfLine = () => column === 0

  const currentChar = () => {
    const lr = getLineRangeByLineNumber(line)
    if (!lr) return undefined
    return text.charAt(lr.start + column)
  }

  const nextLine = () : Position => {

    const start = { line, column }
    column = 0
    line += 1
    return {
      start,
      end: { line, column }
    }
  }

  const eatLine = () => {
    return nextLine()
  }

  const skipWhitespaces = () : number => {
    let count = 0
    while (/[ \t]/.test(currentChar() || 'a')) {
      column += 1
      count += 1
    }
    return count
  }

  const adv = (param: number | string | RegExp) : Position => {
    const start = { line, column }
    if (typeof param === 'number') {
      column += param // TODO: crossing the line?
    }
    if (typeof param == 'string') {
      const i = getLine(line, column).indexOf(param)
      if (i > 0) column += i
    }
    if (param instanceof RegExp) {
      const m = param.exec(getLine(line, column))
      if (m) {
        column += m.index
      }
    }

    return {
      start,
      end: { line, column }
    }

  }

  const match = (
    pattern: RegExp,
    { advance = false }: { advance: boolean } = { advance: false }
  ) : {
    match: RegExpExecArray,
    position: Position;
  } | undefined => {
    const l = getLine(line, column)
    if (!l) return undefined
    const match = pattern.exec(l)
    if (!match) return undefined
    const startColumn = column + match.index
    const endColumn = startColumn + match[0].length
    if (advance) {
      column += match.index + match[0].length
    }
    return {
      match,
      position: {
        start: { line, column: startColumn },
        end: { line, column: endColumn },
      }
    }
  }

  const advance = (pattern: RegExp) : {
    match?: RegExpExecArray,
    position?: Position;
  } => {
    const l = getLine(line, column)
    if (!l) return {}
    const match = pattern.exec(l)
    if (!match) return {}
    const startColumn = column + match.index
    const endColumn = startColumn + match[0].length
    column += match.index + match[0].length
    return {
      match,
      position: {
        start: { line, column: startColumn },
        end: { line, column: endColumn },
      }
    }
  }

  const EOF = () => {
    const lr = getLineRangeByLineNumber(line)
    if (!lr) return true
    return lr.start + column >= text.length
  }

  const now = () => ({ line, column })

  const position = ({ offset, range }: { offset?: Point, range?: Range } = {}): Position => {
    const firstLine = getLineRangeByLineNumber(0)
    let ln = 0
    while (getLineRangeByLineNumber(ln)) {
      ln += 1
    }

    return {
      start: { line: 0, column: 0 },
      end: { line: ln, column: 0 }
    }
  }

  return {
    isStartOfLine,
    currentChar,
    getLine: () => getLine(line, column),
    skipWhitespaces,
    match,
    advance,
    nextLine,
    now,
    eatLine,
    substring,
    EOF,
    adv,
    isLastLine,
  }
}
