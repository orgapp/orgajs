import { Point, Position } from 'unist'

export const isEqual = (p1: Point, p2: Point) => {
  return p1.line === p2.line && p1.column === p2.column
}

export const isGreaterOrEqual = (p1: Point, p2: Point) => {
  return isEqual(p1, p2) || before(p1)(p2)
}

const compare = (p1: Point, p2: Point): boolean => {
  if (p1.line > p2.line) return true
  if (p1.line === p2.line && p1.column > p2.column) return true
  return false
}

export const after = (p1: Point) => (p2: Point) => {
  return compare(p2, p1)
}

export const before = (p1: Point) => (p2: Point) => {
  return compare(p1, p2)
}

export const isEmpty = (position: Position) => {
  return !position || isEqual(position.start, position.end)
}
