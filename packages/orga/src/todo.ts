export interface TodoKeywordSet {
	next: (value: string, reverse?: boolean) => string | undefined
	actionable: (value: string) => boolean
	includes: (value: string) => boolean
	readonly keywords: string[]
}

export const defaultTodoManager = todoManager('TODO DONE')

export interface TodoManager extends TodoKeywordSet {
	add: (todo: string) => void
}

/**
 * A simple todo list manager that allows cycling through keywords.
 * Keywords before the pipe '|' are considered actionable.
 * Keywords after the pipe are considered non-actionable.
 *
 * Example usage:
 *   todo('todo doing | done cancelled')
 *   // Cycles through: todo -> doing -> done -> cancelled -> todo ...
 *
 * @param value A string of space-separated keywords with an optional pipe '|'.
 */
export function parseTodoKeywords(value: string): TodoKeywordSet {
	const keywords = value.trim().split(' ').filter(Boolean)

	let divider = keywords.indexOf('|')
	if (divider === -1) divider = keywords.length - 1

	return {
		next,
		actionable,
		includes: (v: string) => keywords.includes(v),
		get keywords() {
			return keywords.filter((k) => k !== '|')
		}
	}

	/**
	 * Get the next keyword in the list, circularly.
	 * @returns The next keyword or undefined if not found.
	 */
	function next(value: string, reverse = false) {
		const index = keywords.indexOf(value)
		if (index === -1) return undefined
		let nextIndex = _next(index, reverse)
		return keywords[nextIndex]
	}

	function _next(idx: number, reverse: boolean) {
		let offset = reverse ? -1 : 1
		let nextIndex = idx + offset
		if (nextIndex < 0) nextIndex = keywords.length - 1
		if (nextIndex >= keywords.length) nextIndex = 0
		// skip the divider
		if (keywords[nextIndex] === '|') {
			return _next(nextIndex, reverse)
		}
		return nextIndex
	}

	function actionable(value: string) {
		const index = keywords.indexOf(value)
		if (index !== -1 && index < divider) return true
		return false
	}
}

export function todoManager(...keywords: string[]): TodoManager {
	const todos: TodoKeywordSet[] = keywords.map(parseTodoKeywords)

	return {
		next,
		actionable,
		includes,
		add,
		get keywords() {
			return todos.flatMap((t) => t.keywords)
		}
	}

	function next(value: string, reverse = false) {
		for (const todoSet of todos) {
			if (todoSet.includes(value)) {
				const nextKeyword = todoSet.next(value, reverse)
				if (nextKeyword) return nextKeyword
			}
		}
		return undefined
	}

	function actionable(value: string) {
		for (const todoSet of todos) {
			if (todoSet.includes(value)) {
				return todoSet.actionable(value)
			}
		}
		return false
	}

	function includes(value: string) {
		for (const todoSet of todos) {
			if (todoSet.includes(value)) {
				return true
			}
		}
		return false
	}

	function add(todo: string) {
		todos.push(parseTodoKeywords(todo))
	}
}
