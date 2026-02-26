import type { Document, ParseOptions } from 'orga'
import type { Plugin } from 'unified'

declare const reorgParse: Plugin<
	[(Readonly<ParseOptions> | null | undefined)?],
	string,
	Document
>
export default reorgParse
