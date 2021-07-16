import { Point, Position } from 'unist';

/** Like {@link Point}, but with a known source index. */
export type SourcePoint = Required<Point>;

/** Like {@link Position}, but with known indices. */
export type SourcePosition = Position & { start: SourcePoint, end: SourcePoint };

export interface TextKitCore {
  numberOfLines: number;

  /**
   * Retrieve the portion of the text covered by the given span.
   *
   * By default, the `end` is considered to be exclusive, that is,
   * only points up to, but not including the `end` are represented in
   * the result. The start is considered to be inclusive.
   *
   * `end` may be a {@link Point}, or may be `EOL`, in which case it
   * is the end of the `start` line (excluding any newline character),
   * or `EOF`, in which case it is the end of the document.
   *
   * `end` is optional and defaults to `EOL`.
   *
   * Note that if `end` is before or equal to `start`, this is the empty string.
   */
  substring: ({ start, end }: {
    start: Point,
    end?: Point | 'EOL' | 'EOF'
  }) => string;

  /** Get the character at the given point, if it exists. */
  charAt(loc: Point): string | undefined;

  /** Return the span of the document covered by the given line, or `undefined` if the line doesn't exist. */
  linePosition: (ln: number) => SourcePosition | undefined;

  /**
   * Return the {@link SourcePoint} for a given `index` in the text.
   *
   * Note the following exceptions:
   *
   * - if `index` is less than `0` then this is the starting point;
   * - if `index` is larger than the greatest index in the text then this is the maximum point;
   * - if the text is empty then this is the 1-1-point
   */
  location: (index: number) => SourcePoint;

  /** Offset the given `point` by the provided `offset`. */
  shift: (point: Point, offset: number) => SourcePoint;

  /**
   * {@link SourcePoint} representing the first character of the given
   * `line` (possibly the newline itself). Returns `undefined` if the
   * line does not exist.
   */
  bol(line: number): SourcePoint | undefined;

  /**
   * {@link SourcePoint} representing the newline character of the
   * given `line`, or EOF. Returns `undefined` if the line does not
   * exist.
   */
  eol(line: number): SourcePoint | undefined;

  /**
   * Return a {@link SourcePoint} representing the start of the text.
   *
   * This is either the first character of the text, or {@link eof}.
   */
  bof(): SourcePoint;

  /**
   * Return a {@link SourcePoint} representing the end of the text.
   *
   * Note that this does not represent a point of a physical character
   * in the file, but rather a virtual point (beyond the last
   * character). This can be used to include the last character of the
   * text in a range.
   */
  eof(): SourcePoint;

  /**
   * Return the distance (possibly negative) between two points in the
   * source, i.e., the distance `n` such that `shift(range.start, n)`
   * would be at `range.end`.
   */
  distance(range: Position): number;
}

export interface TextKit extends TextKitCore {
  /**
   * Match `pattern` against the region of text selected by `position`.
   *
   * If the match fails, returns `undefined`. If the match succeeds,
   * returns the match array along with the span covered by the match.
   */
  match: (pattern: RegExp, position: Position) => {
    position: SourcePosition,
    captures: string[]
  } | undefined;

  /**
   * {@link SourcePoint} representing the last non-newline character
   * of the given `line`. Returns `undefined` if the line does not
   * exist or is empty.
   */
  lastNonEOL(line: number): SourcePoint | undefined;
}

export const core = (text: string): TextKitCore => {

  const strLines = text.split(/^/mg);
  const lines: number[] = strLines.length > 0 ? [0] : []; // index of line starts
  strLines.slice(0, strLines.length - 1).forEach((l, i) => lines.push(lines[i] + l.length));

  /** Return `true` if the given line number is in range. */
  const lineExists = (ln: number): boolean => {
    return (ln >= 1 && ln <= lines.length);
  };

  /** Return the length of the given line, if it exists. */
  const lengthOfLine = (line: number): number | undefined => {
    if (!lineExists(line)) return;
    return (line < lines.length ? lines[line] : text.length) - lines[line - 1];
  }

  const bof = (): SourcePoint => ({ line: 1, column: 1, offset: 0 });

  const eof = (): SourcePoint => {
    const len = lengthOfLine(lines.length);
    if (!len) return { line: 1, column: 1, offset: 0 };
    return {
      line: lines.length,
      column: len + 1,
      offset: lines[lines.length - 1] + len,
    };
  };

  const bol = (ln: number): SourcePoint | undefined => {
    if (!lineExists(ln)) return;
    return { line: ln, column: 1, offset: lines[ln - 1] };
  }

  const eol = (ln: number): SourcePoint | undefined => {
    const len = lengthOfLine(ln);
    if (!len) return;
    const endIndex = lines[ln - 1] + len - 1;
    const end = { line: ln, column: len, offset: endIndex };
    return ((text.charAt(endIndex).match(/$/mg) ?? []).length > 1) ? end : eof();
  }

  const toIndex = (point: Point): number => {
    const index = toIndexOrEOF(point);
    return index === 'EOF' ? text.length : index;
  }

  /** Return an index that is guaranteed to represent a character in the source or EOF. */
  const fixIndex = (i: number): number =>
    i < 0 ? 0 : i >= text.length ? text.length : i;

  const toIndexOrEOF = ({ line, column, offset }: Point): number | 'EOF' => {
    if (offset !== undefined) return fixIndex(offset);
    if (text.length === 0 || line < 1) return 0;
    if (line > lines.length) return 'EOF';
    const targetLineStartIndex = lines[line - 1];
    if (column < 1) return targetLineStartIndex;
    const maxCol = lengthOfLine(line)!;
    if (column > maxCol && line === lines.length) return 'EOF';
    const index = targetLineStartIndex + Math.min(column, maxCol) - 1;
    return Math.min(index, text.length);
  };

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

  const location = (index: number): SourcePoint => {
    const line = findLine(index)
    if (lines.length === 0) return eof();
    const lineStartIndex = lines[line - 1];
    const offset = toIndex({ line, column: index - lineStartIndex + 1 });
    const column = offset - lineStartIndex + 1;
    return {
      line,
      column,
      offset,
    }
  }

  const shift = (point: Point, offset: number): SourcePoint => {
    return location(toIndex(point) + offset)
  }

  const linePosition = (ln: number): SourcePosition | undefined => {
    const [start, end] = [bol(ln), eol(ln)];
    if (!start || !end) return;
    return {
      start,
      end: shift(end, 1),
    };
  }

  const charAt = (loc: Point): string | undefined => {
    const c = text.charAt(toIndex(loc));
    return c === "" ? undefined : c;
  };

  const substring = ({ start, end = 'EOL' }: {
    start: Point,
    end?: Point | 'EOL' | 'EOF'
  }): string => {
    const startIndex = toIndex(start);
    if (end === 'EOL') {
      const line = text.substring(startIndex, toIndex({ line: start.line, column: Infinity }) + 1);
      return line.split(/$/mg)[0];
    } else if (end === 'EOF') {
      return text.substring(startIndex);
    } else {
      const endIndex = toIndex(end);
      if (endIndex < startIndex) return "";
      return text.substring(startIndex, endIndex);
    }
  }

  const distance = (range: Position): number => {
    return toIndex(range.end) - toIndex(range.start);
  };

  return {
    get numberOfLines(): number {
      return lines.length
    },
    charAt,
    substring,
    linePosition,
    location,
    shift,
    bol,
    eol,
    bof,
    eof,
    distance,
  }
}

export const extra = (tk: TextKitCore): TextKit => {
  const { eol, shift, substring } = tk;
  const lastNonEOL = (ln: number): SourcePoint | undefined => {
    const end = eol(ln);
    if (!end || end.column === 1) return;
    return shift(end, -1);
  }

  const match = (
    pattern: RegExp,
    position: Position,
  ): { position: SourcePosition, captures: string[] } | undefined => {
    const content = substring(position)
    if (!content) return undefined
    const match = pattern.exec(content)
    if (!match) return undefined
    const start = shift(position.start, match.index);
    const end = shift(start, match[0].length);
    return {
      captures: match.map(m => m),
      position: { start, end },
    };
  };

  return {
    ...tk,
    lastNonEOL,
    match,
  }
}

export default (text: string): TextKit => extra(core(text));
