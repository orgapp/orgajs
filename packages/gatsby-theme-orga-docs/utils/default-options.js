const path = require('path')

const defaultOptions = {
  location: ['docs'],
  imageMaxWidth: 1380,
  components: {},
}

module.exports = options => {
  return {
    ...defaultOptions,
    ...options,
  }
}
