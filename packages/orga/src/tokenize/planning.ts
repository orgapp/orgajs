import type { Reader } from 'text-kit'
import type { Point } from 'unist'
import { parse as parseTimestamp } from '../timestamp.js'
import type { Token } from '../types.js'

export default (keywords: string[]) =>
	(reader: Reader): Token[] | undefined => {
		const { now, match, eat, getLine, jump } = reader
		const ws = eat('whitespaces')

		const pattern = `(${keywords.join('|')}):`

		if (!match(RegExp(pattern, 'y'))) {
			ws && jump(ws.position.start)
			return
		}

		const currentLine = getLine()

		const { line, column, offset } = now()

		const getLocation = (_offset: number): Point => ({
			line,
			column: column + _offset,
			offset: offset + _offset
		})

		// the timestamp between `from` and `to`, without surrounding whitespace
		const timestamp = (from: number, to: number): Token => {
			const text = currentLine.slice(from, to)
			const start = from + text.length - text.trimStart().length
			const value = text.trim()
			return {
				type: 'planning.timestamp',
				value: parseTimestamp(value),
				position: {
					start: getLocation(start),
					end: getLocation(start + value.length)
				}
			}
		}

		const all: Token[] = []

		const p = RegExp(pattern, 'g')
		let m = p.exec(currentLine)
		while (m) {
			all.push({
				type: 'planning.keyword',
				value: m[1],
				position: {
					start: getLocation(m.index),
					end: getLocation(p.lastIndex)
				}
			})
			const from = p.lastIndex
			m = p.exec(currentLine)
			all.push(timestamp(from, m ? m.index : currentLine.length))
		}
		eat('line')

		return all
	}
