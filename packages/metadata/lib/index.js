/**
 * TODO: more types?
 * @typedef {string} Value
 * @typedef {Record<string, Value | Value[]>} Metadata
 */

const TO_DISCARD = [
	'caption',
	'header',
	'name',
	'plot',
	'results',
	/^attr_\w+/i, // Affiliated Keywords
	/^begin_\w+/i,
	/^end_\w+/i,
	'begin',
	'end', // blocks
	'call', // call
	'jsx', // orga's jsx support
]

/**
 * @param {string} key
 * @returns {boolean}
 */
function shouldDiscard(key) {
	return !!TO_DISCARD.find((test) => {
		if (typeof test === 'string') {
			return test === key.toLowerCase()
		}
		return test.test(key)
	})
}

/**
 * trim whitespaces and strip quotes if necessary
 * @param {string} text
 * @returns {Value}
 */
function processValue(text) {
	return text.trim().replace(/^["'](.+(?=["']$))["']$/, '$1')
}

/**
 * @param {Metadata} data
 */
function pushTo(data) {
	/**
	 * @param {string} _key
	 * @param {string} _value
	 * @returns {Metadata}
	 */
	return function (_key, _value) {
		const key = _key.toLowerCase()
		const value = processValue(_value)

		const existing = data[key]
		if (existing) {
			Array.isArray(existing)
				? existing.push(value)
				: (data[key] = [existing, value])
		} else {
			data[key] = value
		}
		return data
	}
}

/**
 * @param {string} text
 * @returns {Metadata}
 */
export function parse(text) {
	const matches = text.matchAll(/^\s*#\+(\S+):(.*)$/gm)
	return [...matches].reduce((data, [, key, value]) => {
		if (shouldDiscard(key)) return data
		return pushTo(data)(key, value)
	}, {})
}
