// stolen code from @mdx-js/loader

/**
 * Webpack loader
 *
 * @todo once webpack supports ESM loaders, remove this wrapper.
 *
 * @this {LoaderContext}
 * @param {string} code
 */
module.exports = function orgLoader(code) {
	const callback = this.async()
	// Note that `import()` caches, so this should be fast enough.
	import('./lib/index.js').then((module) =>
		module.loader.call(this, code, callback)
	)
}
