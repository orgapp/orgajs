// stolen code from @jdx-js/loader

/**
 * Webpack loader
 *
 * @todo once webpack supports ESM loaders, remove this wrapper.
 *
 * @this {LoaderContext}
 * @param {string} code
 */
module.exports = function (code) {
  const callback = this.async()
  // Note that `import()` caches, so this should be fast enough.
  import('./dist/loader.js').then((module) =>
    module.default.call(this, code, callback)
  )
}
