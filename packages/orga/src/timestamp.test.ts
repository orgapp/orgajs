import assert from 'node:assert'
import { describe, it } from 'node:test'
import { parse } from './timestamp'

describe('timestamp', () => {
	it('parses date only', () => {
		assert.deepEqual(parse('<2021-04-24 Sat>'), {
			active: true,
			start: { year: 2021, month: 4, day: 24 }
		})
		assert.deepEqual(parse('<2021-04-24>'), {
			active: true,
			start: { year: 2021, month: 4, day: 24 }
		})
	})

	it('parses inactive timestamps', () => {
		assert.deepEqual(parse('[2021-04-24 Sat]'), {
			active: false,
			start: { year: 2021, month: 4, day: 24 }
		})
	})

	it('parses date and time', () => {
		assert.deepEqual(parse('<2021-04-24 Sat 19:15>'), {
			active: true,
			start: { year: 2021, month: 4, day: 24, hour: 19, minute: 15 }
		})
		assert.deepEqual(parse('<2021-04-24 Sat 9:05>'), {
			active: true,
			start: { year: 2021, month: 4, day: 24, hour: 9, minute: 5 }
		})
	})

	it('parses time ranges', () => {
		assert.deepEqual(parse('<2021-04-24 Sat 19:15-22:00>'), {
			active: true,
			start: { year: 2021, month: 4, day: 24, hour: 19, minute: 15 },
			end: { year: 2021, month: 4, day: 24, hour: 22, minute: 0 }
		})
	})

	it('parses date ranges', () => {
		assert.deepEqual(parse('<2019-08-19 Mon>--<2019-08-20 Tue>'), {
			active: true,
			start: { year: 2019, month: 8, day: 19 },
			end: { year: 2019, month: 8, day: 20 }
		})
		assert.deepEqual(parse('[2019-08-19 Mon 10:00]--[2019-08-20 Tue 12:30]'), {
			active: false,
			start: { year: 2019, month: 8, day: 19, hour: 10, minute: 0 },
			end: { year: 2019, month: 8, day: 20, hour: 12, minute: 30 }
		})
	})

	it('parses repeaters', () => {
		for (const repeater of ['+1w', '++1w', '.+1w', '.+2d/3d']) {
			assert.deepEqual(parse(`<2026-01-05 Mon 10:00 ${repeater}>`), {
				active: true,
				start: { year: 2026, month: 1, day: 5, hour: 10, minute: 0 },
				repeater
			})
		}
	})

	it('parses warning delays', () => {
		for (const warning of ['-2d', '--2d']) {
			assert.deepEqual(parse(`<2026-01-09 Fri ${warning}>`), {
				active: true,
				start: { year: 2026, month: 1, day: 9 },
				warning
			})
		}
	})

	it('parses repeater and warning delay', () => {
		const expected = {
			active: true,
			start: { year: 2026, month: 1, day: 9 },
			repeater: '+1m',
			warning: '-3d'
		}
		assert.deepEqual(parse('<2026-01-09 Fri +1m -3d>'), expected)
		assert.deepEqual(parse('<2026-01-09 Fri -3d +1m>'), expected)
	})

	it('ignores surrounding whitespace', () => {
		assert.deepEqual(parse(' <2021-04-24 Sat> '), {
			active: true,
			start: { year: 2021, month: 4, day: 24 }
		})
	})

	it('rejects text that is not a timestamp', () => {
		for (const text of [
			'',
			'2021-04-24',
			'<2021-04-24 Sat]',
			'<2021-04-24 Sat foo>',
			'<2021-04-24 Sat +1w +2w>',
			'<2021-04-24 Sat> trailing',
			'<2019-08-19 Mon>--[2019-08-20 Tue]'
		]) {
			assert.equal(parse(text), undefined, text)
		}
	})
})
