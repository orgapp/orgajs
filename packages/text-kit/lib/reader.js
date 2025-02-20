/**
 * @import {Point,Position} from 'unist'
 * @import {CoreAPI} from './core.js'
 * @import {Range} from '../index.js'
 */

/**
 * @typedef {'char'|'line'|'whitespaces'|'newline'|RegExp|number} eatable
 */

import enhance from './utils/index.js'

/**
 * @type {Record<string,string>}
 */
const PAIRS = [
	['{', '}'],
	['[', ']'],
	['(', ')'],
	['<', '>'],
].reduce((all, [l, r]) => {
	return {
		...all,
		[l]: r,
		[r]: l,
	}
}, {})

/**
 * @param {CoreAPI} _core
 * @param {Partial<Range>} [range={}]
 */
function reader(_core, range = {}) {
	const core = enhance(_core)

	let cursor = core.toIndex(range.start || 0)
	const end = core.toIndex(range.end || Infinity)

	const getChar = (offset = 0) => {
		const index = cursor + offset
		if (index >= end || index < 0) return undefined
		return core.text.charAt(index)
	}

	/**
	 * Get the current line
	 * returns null if cursor is at the end of the document
	 */
	function getLine() {
		const pos = core.linePosition(cursor)
		if (!pos) return null
		return core.substring(cursor, pos.end)
	}

	/**
	 * @param {Point|number} point
	 */
	function jump(point) {
		cursor = Math.min(end, core.toIndex(point))
	}

	const now = () => core.toPoint(cursor)

	/**
	 * @param {eatable} [param='char']
	 * @returns {{position:Position,value:string}|undefined}
	 */
	function eat(param = 'char') {
		let value

		const position = {
			start: core.toPoint(cursor),
			end: core.toPoint(cursor),
		}

		if (cursor >= end) return undefined
		if (param === 'char') {
			value = getChar()
			cursor += 1
		} else if (param === 'line') {
			const lineEnd = core.linePosition(cursor)
			const e =
				lineEnd === null ? end : Math.min(end, lineEnd.end.offset ?? end)
			value = core.substring(cursor, e)
			cursor = e
		} else if (param === 'whitespaces') {
			return eat(/^[ \t]+/)
		} else if (param === 'newline') {
			return eat(/^[\n\r]/)
		} else if (typeof param === 'number') {
			const adv = Math.min(param, end - cursor)
			value = core.text.substring(cursor, cursor + adv)
			cursor += adv
		} else {
			const m = match(param)
			if (!m) return
			if (m.position.end.offset !== undefined) cursor = m.position.end.offset
			value = m.result[0]
		}

		position.end = core.toPoint(cursor)
		return {
			position,
			value: value || '',
		}
	}

	/**
	 * @param {RegExp} pattern
	 * @param {Partial<Position>} [range={}]
	 */
	function match(pattern, range = {}) {
		const s = range.start?.offset || cursor
		const e = range.end?.offset || end
		const str = core.text.substring(s, e)
		const m = pattern.exec(str)
		if (!m) return
		return {
			result: m,
			position: {
				start: core.toPoint(cursor + m.index),
				end: core.toPoint(cursor + m.index + m[0].length),
			},
		}
	}

	/**
	 * Find the closing pair of a character
	 * @param {Point|number} [index=cursor]
	 */
	function findClosing(index = cursor) {
		let cursor = core.toIndex(index)
		const opening = core.text.charAt(cursor)
		if (!opening) return
		const closing = PAIRS[opening] || opening

		let balance = 1
		cursor += 1
		while (cursor < end) {
			const char = core.text.charAt(cursor)
			if (char === opening) {
				balance += 1
			}

			if (char === closing) {
				if (opening !== closing) {
					balance -= 1
				} else {
					balance = 0
				}
			}

			if (balance === 0) {
				return core.toPoint(cursor)
			}
			cursor += 1
		}
	}

	const isStartOfLine = () => {
		return cursor === 0 || getChar(-1) === '\n'
	}

	/**
	 * Find the first index of a string
	 * @param {string }str
	 * @param {Partial<Position>} [range={}]
	 */
	function indexOf(str, range = {}) {
		const s = range.start?.offset || cursor
		const e = range.end?.offset || core.endOfLine(cursor)?.offset || end
		const substr = core.text.substring(s, e)
		const i = substr.indexOf(str)
		if (i === -1) return null
		return core.toPoint(cursor + i)
	}

	return {
		...core,
		getChar,
		getLine,
		eat,
		jump,
		match,
		indexOf,
		findClosing,
		isStartOfLine,
		now: () => {
			return now()
		},

		beginOfLine: () => core.beginOfLine(cursor),
		endOfLine: () => core.endOfLine(cursor),

		/**
		 * Read a range of text
		 * @param {Partial<Range>} [range={}]
		 */
		read: (range = {}) => {
			return reader(_core, {
				start: range.start || cursor,
				end: range.end || end,
			})
		},
	}
}

export default reader
