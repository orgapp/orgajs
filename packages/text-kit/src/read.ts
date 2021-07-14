import { Point, Position } from 'unist';

export default (text: string) => {

  const strLines = text.split(/^/mg);
  const lines: number[] = strLines.length > 0 ? [0] : []; // index of line starts
  strLines.slice(0, strLines.length - 1).forEach((l, i) => lines.push(lines[i] + l.length));

  /** Return the length of the given line, if it exists. */
  const lengthOfLine = (line: number): number | undefined => {
    if (line < 1 || line > lines.length) return;
    return (line < lines.length ? lines[line] : text.length) - lines[line - 1];
  }

  /**
   * Return the best-fit index of a point in the text.
   *
   * Specifically, if the point is invalid w.r.t. the text, then the
   * following behaviours are observed:
   *
   * - if `line` is less than `1` then the index is `0`;
   * - if `line` is greater than the number of lines, then the maximum index is returned;
   * - if `column` is less than `1` then the start-of-line index is returned;
   * - if `column` is greater than the length of the line, then the end-of-line index is returned;
   * - if the text is empty, then the index is 0
   */
  const toIndex = ({ line, column }: Point): number => {
    if (text.length === 0 || line < 1) return 0;
    if (line > lines.length) return text.length - 1;
    const targetLineStartIndex = lines[line - 1];
    if (column < 1) return targetLineStartIndex;
    const maxCol = lengthOfLine(line)!;
    const index = targetLineStartIndex + Math.min(column, maxCol) - 1;
    return Math.min(index, text.length);
  }

  /**
   * Find the line on which the given `index` resides.
   *
   * Note the following exceptions:
   *
   * - if `index` is less than `0` then this is line `1`;
   * - if `index` is greater than the maximum index then this is the last line
   */
  const findLine = (index: number): number => {
    const l = lines.findIndex((_l, i) => i === lines.length - 1 ? true : index < lines[i + 1]);
    return l === -1 ? 1 : l + 1;
  }

  /**
   * Return the {@link Point} for a given `index` in the text.
   *
   * Note the following exceptions:
   *
   * - if `index` is less than `0` then this is the starting point;
   * - if `index` is larger than the greatest index in the text then this is the maximum point;
   * - if the text is empty then this is the 1-1-point
   */
  const location = (index: number): Point => {
    const line = findLine(index)
    if (lines.length === 0) return { line: 1, column: 1 };
    const lineStartIndex = lines[line - 1];
    const column = toIndex({ line, column: index - lineStartIndex + 1 }) - lineStartIndex + 1;
    return {
      line,
      column,
    }
  }

  /**
   * Match `pattern` against the region of text selected by `position`.
   *
   * If the match fails, returns `undefined`. If the match succeeds,
   * returns the match array along with the span covered by the match.
   */
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
        start: location(offset + match.index),
        end: location(offset + match.index + match[0].length - 1),
      }
    }
  }

  /** Offset the given `point` by the provided `offset`. */
  const shift = (point: Point, offset: number): Point => {
    return location(toIndex(point) + offset)
  }

  /** Return the span of the document covered by the given line, or `undefined` if the line doesn't exist. */
  const linePosition = (ln: number): Position | undefined => {
    const lineLength = lengthOfLine(ln);
    if (!lineLength) return;
    return {
      start: { line: ln, column: 1 },
      end: { line: ln, column: lineLength },
    };
  }

  /**
   * Retrieve the portion of the text covered by the given span (inclusive of ends).
   *
   * `end` may be a {@link Point}, or may be `EOL`, in which case it
   * is the end of the `start` line (including any newline character),
   * or `EOF`, in which case it is the end of the document.
   *
   * `end` is optional and defaults to `EOL`.
   *
   * Note that if `end` is before `start`, this is the empty string.
   */
  const substring = ({ start, end = 'EOL' }: {
    start: Point,
    end?: Point | 'EOL' | 'EOF'
  }): string => {

    const startIndex = toIndex(start);
    const endIndex = end === 'EOF' ? text.length - 1
      : end === 'EOL' ? toIndex({ ...start, column: Infinity })
        : toIndex(end);
    if (endIndex < startIndex) return "";
    return text.substring(startIndex, endIndex + 1)
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
