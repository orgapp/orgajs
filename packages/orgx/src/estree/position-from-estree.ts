export default function positionFromEstree(value) {
  /** @type {NodeLike} */
  const node = value || {}
  /** @type {LocLike} */
  const loc = node.loc || {}
  /** @type {RangeLike} */
  const range = node.range || [0, 0]
  const startOffset = range[0] || node.start
  const endOffset = range[1] || node.end

  return {
    start: {
      line:
        loc.start && typeof loc.start.line === 'number' && loc.start.line > -1
          ? loc.start.line
          : undefined,
      column:
        loc.start &&
        typeof loc.start.column === 'number' &&
        loc.start.column > -1
          ? loc.start.column + 1
          : undefined,
      offset:
        typeof startOffset === 'number' && startOffset > -1
          ? startOffset
          : undefined,
    },
    end: {
      line:
        loc.end && typeof loc.end.line === 'number' && loc.end.line > -1
          ? loc.end.line
          : undefined,
      column:
        loc.end && typeof loc.end.column === 'number' && loc.end.column > -1
          ? loc.end.column + 1
          : undefined,
      offset:
        typeof endOffset === 'number' && endOffset > -1 ? endOffset : undefined,
    },
  }
}
