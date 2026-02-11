import { Reader } from 'text-kit'
import { Token } from '../types.js'
import { tokenize } from './inline/index.js'
import { TodoKeywordSet } from '../todo'

export default (todo: TodoKeywordSet) =>
	(reader: Reader): Token[] | void => {
		const { isStartOfLine, match, now, eol, eat, jump, substring, endOfLine } =
			reader

		if (!isStartOfLine() || !match(/^\*+[ \t]+/my)) return

		// TODO: cache this, for performance sake
		const todos = todo.keywords

		let buffer: Token[] = []

		const stars = eat(/^\*+(?=[ \t])/)
		if (!stars) throw Error('not gonna happen')
		buffer.push({
			type: 'stars',
			level: stars.value.length,
			position: {
				start: stars.position.start,
				end: eat('whitespaces').position.start
			}
		})
		const keyword = eat(
			RegExp(`${todos.map(encodeURIComponent).join('|')}(?=[ \t])`, 'y')
		)
		if (keyword) {
			buffer.push({
				type: 'todo',
				keyword: keyword.value,
				actionable: todo.actionable(keyword.value),
				position: {
					start: keyword.position.start,
					end: eat('whitespaces').position.start
				}
			})
		}
		const priority = eat(/^\[#(A|B|C)\](?=[ \t])/y)
		if (priority) {
			buffer.push({
				type: 'priority',
				...priority,
				position: {
					start: priority.position.start,
					end: eat('whitespaces').position.start
				}
			})
		}

		const tags = match(/[ \t]+(:(?:[\w@_#%-]+:)+)[ \t]*$/m, {
			end: endOfLine()
		})
		let contentEnd = eol(now().line)
		if (tags) {
			contentEnd = tags.position.start
		}

		const r = reader.read({ end: contentEnd })
		const tokens = tokenize(r)
		jump(r.now())

		buffer = buffer.concat(tokens)

		if (tags) {
			eat('whitespaces')
			const tagsPosition = { start: now(), end: tags.position.end }
			const s = substring(tagsPosition.start, tagsPosition.end)
			buffer.push({
				type: 'tags',
				tags: s
					.split(':')
					.map((t) => t.trim())
					.filter(Boolean),
				position: { start: now(), end: tags.position.end }
			})
			jump(tags.position.end)
		}
		return buffer
	}
