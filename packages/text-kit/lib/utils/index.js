/**
 * @import {CoreAPI} from '../core.js'
 */

import substring from './substring.js'
import lines from './lines.js'

/**
 * @param {CoreAPI} core
 */
export default function enhance(core) {
	return substring(lines(core))
}
