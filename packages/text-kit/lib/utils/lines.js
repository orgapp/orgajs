/**
 * @import {Point,Position} from 'unist'
 * @import {CoreAPI} from '../core.js'
 */

/**
 * @callback linePosition
 * @param {Point|number} start
 * @param {Point|number} [end]
 * @returns {Position|null}
 *
 * @callback endOfLine
 * @param {Point|number} ln
 * @returns {Point|undefined}
 *
 * @callback beginOfLine
 * @param {Point|number} ln
 * @returns {Point|undefined}
 *
 */

/**
 * @template {CoreAPI} T
 * @param {T} core
 * @returns {T & {linePosition: linePosition, endOfLine: endOfLine, beginOfLine: beginOfLine}}
 */
export default function (core) {
	/**
	 * @type {linePosition}
	 */
	function linePosition(start, end) {
		let result = null

		if (typeof start === 'number') {
			result = linePosition(core.toPoint(start))
		} else {
			const s = core.bol(start.line)
			const e = core.eol(start.line)
			if (!s || !e) return null
			result = {
				start: s,
				end: e,
			}
		}

		if (end && result) {
			const endLR = linePosition(end)
			if (!endLR) return null
			result.end = endLR.end
		}

		return result
	}

	/**
	 * @type {endOfLine}
	 */
	function endOfLine(ln) {
		const pos = linePosition(ln)
		if (!pos) return undefined
		return pos.end
	}

	/**
	 * @type {beginOfLine}
	 */
	const beginOfLine = (ln) => {
		const pos = linePosition(ln)
		if (!pos) return undefined
		return pos.start
	}

	return {
		...core,
		linePosition,
		endOfLine,
		beginOfLine,
	}
}
