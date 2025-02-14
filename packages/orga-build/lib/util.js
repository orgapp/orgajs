export function buildNav() {}

/**
 * @param {string} file
 * @param {import("./build").Pattern | import("./build").Pattern[]} pattern
 */
export function match(file, pattern) {
	if (Array.isArray(pattern)) {
		return pattern.some((p) => match(file, p))
	}
	if (pattern instanceof RegExp) {
		return pattern.test(file)
	}
	if (typeof pattern === 'string') {
		return file === pattern
	}
	return false
}
