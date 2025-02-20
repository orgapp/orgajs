import type { Document } from 'orga'
import type { Plugin } from 'unified'
import type { Options } from './index.js'

declare const reorgParse: Plugin<
	[(Readonly<Options> | null | undefined)?],
	string,
	Document
>
export default reorgParse
