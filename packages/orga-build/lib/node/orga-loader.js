import { createLoader } from '@orgajs/node-loader'
import latex from 'rehype-katex'

let loader = createLoader({
	rehypePlugins: [latex],
})

export const initialize = loader.initialize
export const load = loader.load
