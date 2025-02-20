/**
 * @import {Point,Position} from 'unist'
 */

/**
 * @typedef {object} CoreAPI
 * @property {string} text
 * @property {number} numberOfLines
 * @property {(index: number) => Point} toPoint
 * @property {(point: Point | number) => number} toIndex
 * @property {(ln: number) => Point | null} bol
 * @property {(ln: number) => Point | null} eol
 * @property {(point: Point, offset: number) => Point} shift
 */

/**
 * @param {number} num
 * @param {number} min
 * @param {number} max
 */
function clamp(num, min, max) {
	return num > max ? max : num < min ? min : num
}

/**
 * @param {string} text
 * @returns {CoreAPI}
 */
function core(text) {
	const strLines = text.split(/^/gm)
	const lines = strLines.length > 0 ? [0] : [] // index of line starts
	strLines
		.slice(0, strLines.length - 1)
		.forEach((l, i) => lines.push(lines[i] + l.length))

	function eof() {
		if (lines.length === 0) {
			return { line: 1, column: 1, offset: 0 }
		}
		return {
			line: lines.length,
			column: text.length - lines[lines.length - 1] + 1,
			offset: text.length,
		}
	}

	/**
	 * @param {number} ln
	 * @returns {Point | null}
	 */
	function bol(ln) {
		const lineIndex = ln - 1
		if (lineIndex >= lines.length || lineIndex < 0) return null
		return { line: ln, column: 1, offset: lines[ln - 1] }
	}

	/**
	 * @param {number} ln
	 * @returns {Point | null}
	 */
	function eol(ln) {
		if (ln > lines.length || ln < 1) return null
		const lastLine = ln === lines.length
		return lastLine ? eof() : toPoint(lines[ln] - 1)
	}

	/**
	 * @param {Point} point
	 * @param {number} offset
	 */
	function shift(point, offset) {
		return toPoint(toIndex(point) + offset)
	}

	/**
	 * @param {number} index
	 * @returns {Point}
	 */
	function toPoint(index) {
		if (index <= 0) return { line: 1, column: 1, offset: 0 }
		if (index >= text.length) return eof()
		let lineIndex = lines.findIndex((l) => l > index)
		if (lineIndex < 0) {
			lineIndex = lines.length
		}

		return {
			line: lineIndex,
			column: index - lines[lineIndex - 1] + 1,
			offset: index,
		}
	}

	/**
	 * @param {Point|number} point
	 * @returns {number}
	 */
	function toIndex(point) {
		if (typeof point === 'number') return clamp(point, 0, text.length)
		if (point.offset) return clamp(point.offset, 0, text.length)
		const lineIndex = point.line - 1
		if (lineIndex < 0 || lines.length === 0) return 0
		if (lineIndex >= lines.length) return text.length
		const i = lines[lineIndex] + point.column - 1
		return Math.min(i, text.length)
	}

	return {
		get text() {
			return text
		},
		get numberOfLines() {
			return lines.length
		},
		shift,
		toPoint,
		toIndex,
		bol,
		eol,
	}
}

export default core
