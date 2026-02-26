/**
 * @import {CoreAPI} from '../core.js'
 */

import lines from './lines.js'
import substring from './substring.js'

/**
 * @param {CoreAPI} core
 */
export default function enhance(core) {
	return substring(lines(core))
}
