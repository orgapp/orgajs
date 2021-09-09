const name = require('./package.json').name
module.exports = {
  ...require('../../jest.config.base'),
  name,
  displayName: name,
}
