import { describe, it } from 'node:test'
import assert from 'node:assert'
import core from '../lib/core.js'
import lines from '../lib/utils/lines.js'

// TODO: add more tests
describe('linePosition', () => {
	const testCases = [
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
			expected: null,
		},
		{
			desc: 'out of bound (after)',
			text: 'abcd',
			point: { line: 10, column: 1, offset: 100 },
			expected: null,
		},
	]

	testCases.forEach(({ desc, text, point, expected }) => {
		it(desc, () => {
			const c = lines(core(text))
			assert.deepStrictEqual(c.linePosition(point), expected)
		})
	})
})
