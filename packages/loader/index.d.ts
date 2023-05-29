import type { ProcessorOptions } from '@orgajs/orgx'
import type { LoaderContext } from 'webpack'

/**
 * A Webpack loader to compile MDX to JavaScript.
 *
 * [Reference for Loader API](https://webpack.js.org/api/loaders/)
 *
 * @this {LoaderContext<unknown>}
 * @param {string} value
 *   The original module source code.
 * @returns {void}
 */
declare function orgLoader(this: LoaderContext<unknown>, value: string): void

export default orgLoader

export type Options = ProcessorOptions
