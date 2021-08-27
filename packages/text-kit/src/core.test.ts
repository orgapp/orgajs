import core from './core'

describe('text-kit core functions', () => {
  const multilineText = ['abcd', '1234', 'xy'].join('\n')

  describe('numberOfLines', () => {
    it.each([
      { desc: 'empty string', input: '', expected: 0 },
      { desc: 'just a newline', input: '\n', expected: 1 },
      { desc: 'with one newline', input: 'test\n', expected: 1 },
      { desc: 'with some newlines', input: 'test1\ntest2\n', expected: 2 },
      { desc: 'starts with newline', input: '\ntest', expected: 2 },
      { desc: 'ends with newline', input: 'test\n', expected: 1 },
      { desc: 'ends with carriage return', input: 'test\r', expected: 1 },
      { desc: 'split with carriage return', input: 'test\rtest', expected: 2 },
    ])('$desc: $expected', ({ input, expected }) => {
      const c = core(input)
      expect(c.numberOfLines).toBe(expected)
    })
  })

  const shared = [
    {
      desc: 'begining of file',
      text: multilineText,
      index: 0,
      point: { line: 1, column: 1, offset: 0 },
    },
    {
      desc: 'end of file',
      text: multilineText,
      index: 11,
      point: { line: 3, column: 2, offset: 11 },
    },
    {
      desc: 'on newline',
      text: multilineText,
      index: 4,
      point: { line: 1, column: 5, offset: 4 },
    },
    {
      desc: 'on last newline',
      text: 'abcd\n',
      index: 4,
      point: { line: 1, column: 5, offset: 4 },
    },
    {
      desc: 'no newline',
      text: 'abcd',
      index: 1,
      point: { line: 1, column: 2, offset: 1 },
    },
  ]

  describe('toPoint', () => {
    it.each([
      ...shared,
      {
        desc: 'before begining',
        text: multilineText,
        index: -1,
        point: { line: 1, column: 1, offset: 0 },
      },
      {
        desc: 'after end',
        text: multilineText,
        index: 20,
        point: { line: 3, column: 3, offset: 12 },
      },
      {
        desc: 'after last newline',
        text: 'abcd\n',
        index: 10,
        point: { line: 1, column: 6, offset: 5 },
      },
    ])('$desc', ({ index, point, text }) => {
      const c = core(text)
      expect(c.toPoint(index)).toEqual(point)
    })
  })

  describe('toIndex', () => {
    it.each([
      ...shared,
      {
        desc: 'before begining with negative offset',
        text: multilineText,
        index: 0,
        point: { line: -1, column: 1, offset: -1 },
      },
      {
        desc: 'before begining with negative line',
        text: multilineText,
        index: 0,
        point: { line: -1, column: 1 },
      },
      {
        desc: 'wrong line and column',
        text: multilineText,
        index: 2,
        point: { line: 10, column: 99, offset: 2 },
      },
      {
        desc: 'after end with offset',
        text: multilineText,
        index: 12,
        point: { line: -1, column: 1, offset: 20 },
      },
      {
        desc: 'after end with line 1',
        text: multilineText,
        index: 12,
        point: { line: 4, column: 1 },
      },
      {
        desc: 'after end with line 2',
        text: multilineText,
        index: 12,
        point: { line: 10, column: 1 },
      },
      {
        desc: 'after end with column',
        text: multilineText,
        index: 12,
        point: { line: 3, column: 5 },
      },
    ])('$desc', ({ index, point, text }) => {
      const c = core(text)
      expect(c.toIndex(point)).toEqual(index)
    })
  })

  describe('shift', () => {
    it.each([
      {
        desc: 'move forward',
        point: { line: 1, column: 1 },
        offset: 2,
        text: multilineText,
        expected: { line: 1, column: 3, offset: 2 },
      },
      {
        desc: 'move backward',
        point: { line: 2, column: 1 },
        offset: -2,
        text: multilineText,
        expected: { line: 1, column: 4, offset: 3 },
      },
      {
        desc: 'move beyond end',
        point: { line: 2, column: 1 },
        offset: 99,
        text: multilineText,
        expected: { line: 3, column: 3, offset: 12 },
      },
      {
        desc: 'move beyond begining',
        point: { line: 2, column: 1 },
        offset: -99,
        text: multilineText,
        expected: { line: 1, column: 1, offset: 0 },
      },
    ])('$desc', ({ text, point, offset, expected }) => {
      const c = core(text)
      expect(c.shift(point, offset)).toEqual(expected)
    })
  })

  describe('bol', () => {
    it.each([
      { desc: 'empty document', text: '', ln: 1, expected: undefined },
      {
        desc: 'line before start of document',
        text: 'text',
        ln: -1,
        expected: undefined,
      },
      {
        desc: 'line after end of document',
        text: 'text',
        ln: 2,
        expected: undefined,
      },
      {
        desc: 'some text, no newline',
        text: 'text',
        ln: 1,
        expected: { line: 1, column: 1, offset: 0 },
      },
      {
        desc: 'some text, newline',
        text: 'text\n',
        ln: 1,
        expected: { line: 1, column: 1, offset: 0 },
      },
      {
        desc: 'just a newline',
        text: '\n',
        ln: 1,
        expected: { line: 1, column: 1, offset: 0 },
      },
      {
        desc: 'multiline',
        text: 'test1\ntest2',
        ln: 2,
        expected: { line: 2, column: 1, offset: 6 },
      },
      {
        desc: 'multiline, empty line',
        text: 'test1\n\n',
        ln: 2,
        expected: { line: 2, column: 1, offset: 6 },
      },
    ])('$desc', ({ text, ln, expected }) => {
      const c = core(text)
      expect(c.bol(ln)).toEqual(expected)
    })
  })

  describe('eol', () => {
    it.each([
      { desc: 'empty document', text: '', ln: 1, expected: undefined },
      {
        desc: 'line before start of document',
        text: 'text',
        ln: -1,
        expected: undefined,
      },
      {
        desc: 'line after end of document',
        text: 'text',
        ln: 2,
        expected: undefined,
      },
      {
        desc: 'some text, no newline',
        text: 'text',
        ln: 1,
        expected: { line: 1, column: 5, offset: 4 },
      },
      {
        desc: 'some text, newline',
        text: 'text\n',
        ln: 1,
        expected: { line: 1, column: 6, offset: 5 },
      },
      {
        desc: 'just a newline',
        text: '\n',
        ln: 1,
        expected: { line: 1, column: 2, offset: 1 },
      },
      {
        desc: 'multiline',
        text: 'text1\ntext2',
        ln: 2,
        expected: { line: 2, column: 6, offset: 11 },
      },
      {
        desc: 'multiline, empty line',
        text: 'text1\n\n',
        ln: 2,
        expected: { line: 2, column: 2, offset: 7 },
      },
      {
        desc: 'newline (carriage return)',
        text: 'text\r',
        ln: 1,
        expected: { line: 1, column: 6, offset: 5 },
      },
    ])('$desc', ({ text, ln, expected }) => {
      const c = core(text)
      expect(c.eol(ln)).toEqual(expected)
    })
  })

  // describe('linePosition', () => {

  //   const c = core('hello\nworld\n')

  //   it('could get by middle of line', () => {
  //     expect(c.linePosition(7)).toEqual({
  //       start: { line: 2, column: 1, offset: 6 },
  //       end: { line: 2, column: 7, offset: 12 },
  //     })
  //   })

  //   it('could get by begin of line', () => {
  //     expect(c.linePosition(6)).toEqual({
  //       start: { line: 2, column: 1, offset: 6 },
  //       end: { line: 2, column: 7, offset: 12 },
  //     })
  //   })

  //   it('could get by end of line', () => {
  //     expect(c.linePosition(5)).toEqual({
  //       start: { line: 1, column: 1, offset: 0 },
  //       end: { line: 2, column: 1, offset: 6 },
  //     })
  //   })

  //   it('could handle index out of bound', () => {
  //     expect(c.linePosition(12)).toEqual({
  //       start: { line: 2, column: 7, offset: 12 },
  //       end: { line: 2, column: 7, offset: 12 },
  //     })
  //   })

  //   it('could handle negative index', () => {
  //     expect(c.linePosition(-1)).toEqual({
  //       start: { line: 1, column: 1, offset: 0 },
  //       end: { line: 1, column: 1, offset: 0 },
  //     })
  //   })

  //   it('could handle begin of file', () => {
  //     expect(c.linePosition(0)).toEqual({
  //       start: { line: 1, column: 1, offset: 0 },
  //       end: { line: 2, column: 1, offset: 6 },
  //     })
  //   })

  //   it('could get by last char', () => {
  //     expect(c.linePosition(11)).toEqual({
  //       start: { line: 2, column: 1, offset: 6 },
  //       end: { line: 2, column: 7, offset: 12 },
  //     })
  //   })

  // })
})
