/**
 * @import {Point} from 'unist'
 * @import {CoreAPI} from '../core.js'
 */

/**
 * @callback substring
 * @param {Point|number} start
 * @param {Point|number} [end]
 * @returns {string}
 */

/**
 * @template {CoreAPI} T
 * @param {T} core
 * @returns {T & {substring: substring}}
 */
export default function addSubstring(core) {
	/**
	 * @type {substring}
	 */
	function substring(start, end) {
		const { toIndex } = core
		return core.text.substring(toIndex(start), end && toIndex(end))
	}
	return {
		...core,
		substring,
	}
}
