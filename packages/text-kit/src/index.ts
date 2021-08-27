import { Point } from 'unist'
import core from './core'
import reader from './reader'

export interface Range {
  start: Point | number
  end: Point | number
}

export type Reader = ReturnType<typeof reader>

export const read = (text: string, range: Partial<Range> = {}) => {
  return reader(core(text), range)
}
