import type { Timestamp } from './types.js'

// <2021-04-24 Sat 19:15-22:00 +1w -2d>
const TIMESTAMP =
	/^([<[])(\d{4})-(\d{2})-(\d{2})(?:\s+[^\s\d+\-\]>]+)?(?:\s+(\d{1,2}):(\d{2})(?:-(\d{1,2}):(\d{2}))?)?((?:\s+[^\s\]>]+)*)\s*([>\]])$/
const REPEATER = /^(?:\+|\+\+|\.\+)\d+[hdwmy](?:\/\d+[hdwmy])?$/
const WARNING = /^--?\d+[hdwmy]$/
// <a>--<b>
const RANGE = /^(<[^>]*>|\[[^\]]*\])--(<[^>]*>|\[[^\]]*\])$/

const single = (text: string): Timestamp | undefined => {
	const m = TIMESTAMP.exec(text)
	if (!m) return
	const [, open, y, mo, d, h, mi, eh, emi, modifiers, close] = m
	if ((open === '<') !== (close === '>')) return

	const date = { year: +y, month: +mo, day: +d }
	const ts: Timestamp = {
		active: open === '<',
		start: h ? { ...date, hour: +h, minute: +mi } : date
	}
	if (eh) ts.end = { ...date, hour: +eh, minute: +emi }

	for (const mod of modifiers.split(/\s+/).filter(Boolean)) {
		if (!ts.repeater && REPEATER.test(mod)) ts.repeater = mod
		else if (!ts.warning && WARNING.test(mod)) ts.warning = mod
		else return
	}
	return ts
}

/**
 * Parse an org-mode timestamp as written, without converting it to any
 * timezone. Returns `undefined` if `input` is not a timestamp.
 */
export const parse = (input: string): Timestamp | undefined => {
	const text = input.trim()
	const range = RANGE.exec(text)
	if (!range) return single(text)

	const a = single(range[1])
	const b = single(range[2])
	if (!a || !b || a.active !== b.active) return
	return { ...a, end: b.start }
}
