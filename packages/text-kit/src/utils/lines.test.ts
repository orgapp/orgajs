import core from '../core'
import lines from './lines'

// TODO: add more tests
describe('linePosition', () => {
  it.each([
    {
      desc: 'begin of line',
      text: 'abcd',
      point: { line: 1, column: 1, offset: 0 },
      expected: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 5, offset: 4 },
      },
    },
    {
      desc: 'middle of line',
      text: 'abcd',
      point: { line: 1, column: 2, offset: 0 },
      expected: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 5, offset: 4 },
      },
    },
    {
      desc: 'end of line',
      text: 'abcd',
      point: { line: 1, column: 4, offset: 0 },
      expected: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 5, offset: 4 },
      },
    },
    {
      desc: 'out of bound (before)',
      text: 'abcd',
      point: { line: -1, column: 1, offset: -1 },
      expected: undefined,
    },
    {
      desc: 'out of bound (after)',
      text: 'abcd',
      point: { line: 10, column: 1, offset: 100 },
      expected: undefined,
    },
  ])('$desc', ({ text, point, expected }) => {
    const c = lines(core(text))
    expect(c.linePosition(point)).toEqual(expected)
  })
})
