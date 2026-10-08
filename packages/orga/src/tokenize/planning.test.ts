import assert from 'node:assert'
import { describe, it } from 'node:test'
import { defaultLexerOptions } from '../options'
import tokenize from './__tests__/tok'
import { tokenize as lex } from './index'

const date = { year: 2018, month: 1, day: 1 }

describe('tokenize planning', () => {
	it('knows plannings', () => {
		for (const text of [
			'DEADLINE: <2018-01-01 Mon>',
			'  DEADLINE: <2018-01-01 Mon>',
			' \tDEADLINE: <2018-01-01 Mon>',
			' \t DEADLINE: <2018-01-01 Mon>',
			'DEADLINE:   <2018-01-01 Mon>  '
		]) {
			assert.deepEqual(tokenize(text), [
				{
					_text: 'DEADLINE:',
					type: 'planning.keyword',
					value: 'DEADLINE'
				},
				{
					_text: '<2018-01-01 Mon>',
					type: 'planning.timestamp',
					value: { active: true, start: date }
				}
			])
		}
	})

	it('know multiple plannings', () => {
		assert.deepEqual(
			tokenize('DEADLINE: <2020-07-03 Fri> SCHEDULED: <2020-07-03 Fri>'),
			[
				{
					_text: 'DEADLINE:',
					type: 'planning.keyword',
					value: 'DEADLINE'
				},
				{
					_text: '<2020-07-03 Fri>',
					type: 'planning.timestamp',
					value: { active: true, start: { year: 2020, month: 7, day: 3 } }
				},
				{
					_text: 'SCHEDULED:',
					type: 'planning.keyword',
					value: 'SCHEDULED'
				},
				{
					_text: '<2020-07-03 Fri>',
					type: 'planning.timestamp',
					value: { active: true, start: { year: 2020, month: 7, day: 3 } }
				}
			]
		)
	})

	it('gives the exact position of each timestamp', () => {
		const cases: [string, object][] = [
			['<2018-01-01 Mon>', { active: true, start: date }],
			[
				'<2018-01-01 Mon 10:00>',
				{ active: true, start: { ...date, hour: 10, minute: 0 } }
			],
			[
				'<2018-01-01 Mon 10:00-11:30>',
				{
					active: true,
					start: { ...date, hour: 10, minute: 0 },
					end: { ...date, hour: 11, minute: 30 }
				}
			],
			[
				'<2018-01-01 Mon>--<2018-01-03 Wed>',
				{ active: true, start: date, end: { ...date, day: 3 } }
			],
			['[2018-01-01 Mon]', { active: false, start: date }],
			['<2018-01-01 Mon +1w>', { active: true, start: date, repeater: '+1w' }],
			['<2018-01-01 Mon -2d>', { active: true, start: date, warning: '-2d' }],
			[
				'<2018-01-01 Mon .+1w --2d>',
				{ active: true, start: date, repeater: '.+1w', warning: '--2d' }
			]
		]
		for (const [timestamp, value] of cases) {
			const text = `  SCHEDULED:  ${timestamp}  CLOSED: [2018-01-02 Tue]`
			const [, ts] = lex(text, defaultLexerOptions).all()
			assert.deepEqual(
				ts,
				{
					type: 'planning.timestamp',
					value,
					position: {
						start: { line: 1, column: 15, offset: 14 },
						end: {
							line: 1,
							column: 15 + timestamp.length,
							offset: 14 + timestamp.length
						}
					}
				},
				timestamp
			)
		}
	})

	it('keeps the keyword when the timestamp is invalid', () => {
		assert.deepEqual(tokenize('DEADLINE: <2018-01-01 Mon foo>'), [
			{
				_text: 'DEADLINE:',
				type: 'planning.keyword',
				value: 'DEADLINE'
			},
			{
				_text: '<2018-01-01 Mon foo>',
				type: 'planning.timestamp',
				value: undefined
			}
		])
	})

	it('knows these are not plannings', () => {
		assert.deepEqual(tokenize('dEADLINE: <2018-01-01 Mon>'), [
			{
				_text: 'dEADLINE: <2018-01-01 Mon>',
				type: 'text',
				value: 'dEADLINE: <2018-01-01 Mon>'
			}
		])
	})
})
