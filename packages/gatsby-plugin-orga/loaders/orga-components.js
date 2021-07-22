const loaderUtils = require('loader-utils')

module.exports = function () {
  const options = loaderUtils.getOptions(this)
  const components = Object.entries(options.components || {}).map(
    ([k, v]) => `${k}: require('${v}').default`
  )
  return `module.exports = {${components.join(',')}}`
}
