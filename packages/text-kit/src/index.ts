import { Point } from 'unist'
import core from './core.js'
import reader from './reader.js'

export interface Range {
  start: Point | number
  end: Point | number
}

export type Reader = ReturnType<typeof reader>

export const read = (text: string, range: Partial<Range> = {}) => {
  return reader(core(text), range)
}
