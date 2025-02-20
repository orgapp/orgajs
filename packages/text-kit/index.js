/**
 * @import {Point} from 'unist'
 * @typedef {ReturnType<typeof reader>} Reader
 * @typedef {object} Range
 * @property {Point | number} start
 * @property {Point | number} end
 */

import core from './lib/core.js'
import reader from './lib/reader.js'

/**
 * @param {string} text
 * @param {Partial<Range>} [range={}]
 * @returns {Reader}
 */
export function read(text, range = {}) {
	return reader(core(text), range)
}
