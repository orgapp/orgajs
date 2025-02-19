/**
 * @import {Document, ParseOptions} from 'orga'
 * @import {Processor} from 'unified'
 */

/**
 * @typedef {ParseOptions} Options
 */

import { parse } from 'orga'

/**
 * Aadd support for parsing from org-mode.
 *
 * @this {Processor<Document>}
 *   Processor instance.
 * @param {Partial<ParseOptions> | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function reorgParse(options) {
	this.parser = function (document) {
		return parse(document, options)
	}
}
