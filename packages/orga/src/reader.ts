interface Range {
  start: number;
  end: number;
}

export const read = (text: string) => {

  const getLineRangeByIndex = (start: number) : Range => {
    const end = text.indexOf('\n', start)
    return {
      start,
      end: end >= 0 ? end + 1 : text.length,
    }
  }

  const lines: Range[] = [
    getLineRangeByIndex(0), // first line
  ]

  let line = 0
  let column = 0

  const isStartOfLine = () => column === 0

  const getLineRangeByLineNumber = (ln: number): Range | undefined => {
    if (ln < lines.length) { return lines[ln] }
    let startOfNextLine = lines[lines.length - 1].end
    while (ln >= lines.length) {
      if (startOfNextLine < text.length) {
        const nextLine = getLineRangeByIndex(startOfNextLine)
        lines.push(nextLine)
        startOfNextLine = nextLine.end
      } else {
        return undefined
      }
    }
    return lines[ln]
  }

  const getLine = (ln: number = line) => {
    const range = getLineRangeByLineNumber(ln)
    if (!range) {
      console.log(`>>>>>> cant get line range`)
      return ''
    }
    const l = text.substring(range.start + column, range.end)
    if (!l) {
      console.log('>>>', { l, range })
    }
    return l
  }

  const currentChar = () => {
    const lr = getLineRangeByLineNumber(line)
    if (!lr) return undefined
    return text.charAt(lr.start + column)
  }

  const nextLine = () : Position => {

    const start = { line, column }

    column = 0
    if (line < lines.length - 1) {
      line += 1
      return { start, end: { line, column } }
    }

    const startOfNextLine = lines[lines.length - 1].end
    if (startOfNextLine < text.length) {
      lines.push(getLineRangeByIndex(startOfNextLine))
    }
    line += 1

    return {
      start,
      end: { line, column }
    }
  }

  const eatChar = () => {
    column += 1
    if (column >= lines[line].end) {
      nextLine()
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
      const i = getLine().indexOf(param)
      if (i > 0) column += i
    }
    if (param instanceof RegExp) {
      const m = param.exec(getLine())
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
    const l = getLine()
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
    const l = getLine()
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

  const substring = (position: Position) : string | undefined => {
    const startLine = getLineRangeByLineNumber(position.start.line)
    const endLine = getLineRangeByLineNumber(position.end.line)
    if (!startLine || !endLine) return undefined
    const start = startLine.start + position.start.column
    const end = endLine.start + position.end.column
    return text.substring(start, end)
  }

  const isLastLine = () => {
    return lines[line].end === text.length
  }

  const debug = () => ({
    lines,
  })

  return {
    isStartOfLine,
    currentChar,
    getLine,
    skipWhitespaces,
    match,
    advance,
    nextLine,
    position: () => ({ line, column }),
    eatLine,
    substring,
    EOF,
    adv,
    isLastLine,
    debug,
  }
}
